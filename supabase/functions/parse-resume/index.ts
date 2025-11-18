import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('User authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { fileUrl, fileName } = await req.json();
    console.log('Parsing resume:', fileName);

    // Extract file path from URL (after /resumes/)
    const urlParts = fileUrl.split('/resumes/');
    const filePath = urlParts[1];
    console.log('Downloading file from storage:', filePath);

    // Download file from private storage bucket using authenticated client
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('resumes')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error('Storage download error:', downloadError);
      throw new Error(`Failed to download file from storage: ${downloadError?.message}`);
    }

    // Convert file to base64 in chunks to avoid stack overflow
    const fileBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(fileBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64File = btoa(binary);
    
    // Determine MIME type
    const mimeType = fileName.toLowerCase().endsWith('.pdf') 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    console.log('File downloaded successfully, size:', fileBuffer.byteLength, 'bytes');

    // Call Lovable AI to extract text and parse resume using Gemini's document understanding
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // For Gemini, use inline_data format for documents
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are an expert resume parser. Carefully read this ${fileName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOCX'} resume document and extract ALL information with 100% accuracy.

Extract structured information and return ONLY a valid JSON object with these fields:
- skills: array of ALL technical and soft skills mentioned (programming languages, frameworks, tools, soft skills)
- experience: array of work experience objects with structure: [{ company, title, duration, responsibilities, achievements }]
- education: array of education objects with structure: [{ institution, degree, field_of_study, years, gpa }]
- projects: array of project objects with structure: [{ name, description, technologies, link, duration }]
- certifications: array of certification objects with structure: [{ name, issuer, date, credential_id }]
- extractedText: complete full text content of the entire resume

CRITICAL: Extract EVERYTHING from the resume. Do not miss any details. Return arrays for experience, education, projects, and certifications.

Important: Return ONLY the JSON object, no markdown code blocks or extra text.`
              },
              {
                type: 'inline_data',
                inline_data: {
                  mime_type: mimeType,
                  data: base64File
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('AI Gateway raw response:', responseText.substring(0, 500));
    
    let aiData;
    try {
      aiData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid JSON response from AI Gateway');
    }

    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error('Invalid AI response structure:', aiData);
      throw new Error('AI returned invalid response structure');
    }

    const aiResponse = aiData.choices[0].message.content;
    
    // Parse AI response as JSON
    let parsedData;
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = aiResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }
      
      parsedData = JSON.parse(cleanedResponse);
      
      // Ensure arrays exist
      parsedData.skills = parsedData.skills || [];
      parsedData.experience = parsedData.experience || [];
      parsedData.education = parsedData.education || [];
      parsedData.projects = parsedData.projects || [];
      parsedData.certifications = parsedData.certifications || [];
      
      console.log('Successfully parsed resume data:', {
        skillsCount: parsedData.skills.length,
        experienceCount: parsedData.experience.length,
        educationCount: parsedData.education.length,
        projectsCount: parsedData.projects.length,
        certificationsCount: parsedData.certifications.length
      });
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('AI Response text:', aiResponse);
      // If response is not JSON, create structure from text
      parsedData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        extractedText: aiResponse
      };
    }

    // Save to database - store comprehensive data
    const { data: resume, error: insertError } = await supabaseClient
      .from('resumes')
      .insert({
        user_id: user.id,
        file_name: fileName,
        file_url: fileUrl,
        extracted_text: parsedData.extractedText,
        skills: parsedData.skills,
        experience: JSON.stringify(parsedData.experience),
        education: JSON.stringify(parsedData.education),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    console.log('Resume parsed successfully:', resume.id);

    return new Response(
      JSON.stringify({ 
        resumeId: resume.id,
        skills: parsedData.skills,
        experience: parsedData.experience,
        education: parsedData.education,
        projects: parsedData.projects,
        certifications: parsedData.certifications,
        extractedText: parsedData.extractedText
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in parse-resume function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
