import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if admin is making the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Only admins can view recruiters" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all users with recruiter role
    const { data: recruiterRoles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "recruiter");

    if (!recruiterRoles || recruiterRoles.length === 0) {
      return new Response(
        JSON.stringify({ recruiters: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recruiterIds = recruiterRoles.map(r => r.user_id);

    // Get profiles for recruiters
    const { data: recruiterProfiles } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .in("user_id", recruiterIds);

    // Get emails from auth.users
    const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();
    const emailMap: Record<string, string> = {};
    authUsers.forEach(u => {
      if (u.email) {
        emailMap[u.id] = u.email;
      }
    });

    // Get post counts for each recruiter
    const { data: allPosts } = await supabaseAdmin
      .from("job_postings")
      .select("recruiter_id");

    // Count posts per recruiter
    const postCounts: Record<string, number> = {};
    allPosts?.forEach(post => {
      postCounts[post.recruiter_id] = (postCounts[post.recruiter_id] || 0) + 1;
    });

    // Merge all data
    const recruitersWithData = recruiterProfiles?.map(profile => ({
      ...profile,
      email: emailMap[profile.user_id] || "N/A",
      post_count: postCounts[profile.user_id] || 0
    })) || [];

    return new Response(
      JSON.stringify({ recruiters: recruitersWithData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in get-recruiters function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
