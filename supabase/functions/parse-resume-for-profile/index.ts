import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert resume parser with 100% accuracy. Carefully analyze the entire resume text and extract ALL available information with precision.

CRITICAL INSTRUCTIONS:
1. Read the ENTIRE resume thoroughly before extracting any data
2. Extract information exactly as it appears in the resume
3. For fields not found, use empty string "" or empty array [] or 0 as appropriate
4. Be meticulous - do not miss any information
5. For URLs, extract the complete URL including https://
6. For skills, extract ALL mentioned skills, technologies, tools, and frameworks
7. For education, include institution name, degree, field of study, and graduation year
8. For experience, calculate total years based on all work experiences mentioned
9. For professional title, use the most recent or prominent job title
10. For bio, create a compelling 2-3 sentence summary based on the resume content if not explicitly stated

Extract the following information:
- full_name: Complete name of the candidate
- phone: Phone number with country code if available
- location: Complete location (City, State, Country)
- bio: Professional summary or objective (2-3 sentences, create one if not present)
- linkedin_url: Full LinkedIn profile URL
- github_url: Full GitHub profile URL  
- portfolio_url: Portfolio or personal website URL
- skills: Array of ALL skills, technologies, tools, frameworks mentioned
- professional_title: Most recent or prominent job title
- education: Complete education details (institution, degree, field, year)
- experience_years: Total years of professional experience (calculate from dates)
- current_company: Current employer name

Be thorough and accurate. Extract every piece of information available.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this resume thoroughly and extract all information with 100% accuracy:\n\n${resumeText}` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_profile_data",
              description: "Extract structured profile data from resume",
              parameters: {
                type: "object",
                properties: {
                  full_name: { type: "string" },
                  phone: { type: "string" },
                  location: { type: "string" },
                  bio: { type: "string" },
                  linkedin_url: { type: "string" },
                  github_url: { type: "string" },
                  portfolio_url: { type: "string" },
                  skills: { 
                    type: "array",
                    items: { type: "string" }
                  },
                  professional_title: { type: "string" },
                  education: { type: "string" },
                  experience_years: { type: "number" },
                  current_company: { type: "string" }
                },
                required: ["full_name", "phone", "location", "bio", "linkedin_url", "github_url", "portfolio_url", "skills", "professional_title", "education", "experience_years", "current_company"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_profile_data" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const profileData = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ profileData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error parsing resume:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
