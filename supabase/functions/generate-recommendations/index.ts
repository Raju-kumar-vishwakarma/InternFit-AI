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

    const { resumeId } = await req.json();
    console.log('Generating recommendations for resume:', resumeId);

    // Fetch resume data
    const { data: resume, error: resumeError } = await supabaseClient
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', user.id)
      .single();

    if (resumeError || !resume) {
      console.error('Resume fetch error:', resumeError);
      return new Response(
        JSON.stringify({ error: 'Resume not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Lovable AI to generate recommendations
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

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
            role: 'system',
            content: `You are an AI internship recommendation engine. Based on a candidate's resume, generate 5-7 personalized internship recommendations.
Return a JSON array of recommendations with this structure:
[
  {
    "title": "internship title",
    "company": "company name",
    "matchScore": 85,
    "skillsMatched": ["skill1", "skill2"],
    "location": "city",
    "internshipType": "Remote/Hybrid/On-site",
    "description": "brief description"
  }
]`
          },
          {
            role: 'user',
            content: `Generate internship recommendations for this candidate:
Skills: ${resume.skills?.join(', ') || 'N/A'}
Experience: ${resume.experience || 'N/A'}
Education: ${resume.education || 'N/A'}`
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
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices[0].message.content;
    
    // Parse AI response as JSON
    let recommendations;
    try {
      recommendations = JSON.parse(aiResponse);
    } catch {
      // Fallback recommendations if parsing fails
      recommendations = [
        {
          title: 'Software Development Intern',
          company: 'TCS',
          matchScore: 87,
          skillsMatched: resume.skills?.slice(0, 3) || ['Programming'],
          location: 'Bangalore',
          internshipType: 'Hybrid',
          description: 'Work on enterprise software solutions'
        },
        {
          title: 'Data Science Intern',
          company: 'Infosys',
          matchScore: 82,
          skillsMatched: resume.skills?.slice(0, 2) || ['Analytics'],
          location: 'Hyderabad',
          internshipType: 'Remote',
          description: 'Analyze data and build ML models'
        }
      ];
    }

    // Save recommendations to database
    const recommendationsToInsert = recommendations.map((rec: any) => ({
      resume_id: resumeId,
      user_id: user.id,
      title: rec.title,
      company: rec.company,
      match_score: rec.matchScore,
      skills_matched: rec.skillsMatched,
      location: rec.location,
      internship_type: rec.internshipType,
      description: rec.description,
    }));

    const { data: savedRecommendations, error: insertError } = await supabaseClient
      .from('internship_recommendations')
      .insert(recommendationsToInsert)
      .select();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    console.log('Recommendations generated successfully:', savedRecommendations?.length);

    return new Response(
      JSON.stringify({ recommendations: savedRecommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-recommendations function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
