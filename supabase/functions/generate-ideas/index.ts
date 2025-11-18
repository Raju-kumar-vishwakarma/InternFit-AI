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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert idea generator for InternFit, an AI-powered Internship & Job Recommendation System.

Generate 25+ fresh, unique, innovative, and SIH-level ideas focused on:
- Smart internship recommendations
- Career guidance
- Resume analysis
- Skill gap detection
- Employability score
- AI-based interview evaluation
- Personalized career roadmap
- Youth unemployment solutions
- Government internship ecosystem
- Rural-inclusive features
- Accessibility & fairness in hiring
- Skill India / Digital India alignment

For EACH idea, provide:
1. **Title**: Clear, catchy name (max 10 words)
2. **Category**: One of [AI Features, Platform Features, Government Ideas, User Experience, Data & Insights, Innovation, Future Expansion]
3. **Description**: 3-5 sentences explaining the feature
4. **Why Useful**: 2-3 sentences on impact
5. **How It Solves**: 2-3 sentences on the solution approach

Format each idea EXACTLY like this:
---IDEA START---
TITLE: [Idea Title]
CATEGORY: [Category Name]
DESCRIPTION: [3-5 sentence description]
WHY_USEFUL: [2-3 sentence benefit explanation]
HOW_SOLVES: [2-3 sentence solution approach]
---IDEA END---

Generate 25+ diverse ideas covering all categories. Be creative and innovative!`;

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
          { role: "user", content: "Generate 25+ innovative ideas for InternFit platform. Make them unique, practical, and impactful." }
        ],
        stream: true,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("generate-ideas error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});