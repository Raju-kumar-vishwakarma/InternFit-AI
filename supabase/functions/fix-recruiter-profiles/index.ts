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
        JSON.stringify({ error: "Only admins can fix recruiter profiles" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all recruiters
    const { data: recruiterRoles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "recruiter");

    if (!recruiterRoles || recruiterRoles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No recruiters found", created: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recruiterIds = recruiterRoles.map(r => r.user_id);

    // Check which recruiters already have profiles
    const { data: existingProfiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .in("user_id", recruiterIds);

    const existingProfileIds = new Set(existingProfiles?.map(p => p.user_id) || []);

    // Get emails from auth.users for recruiters without profiles
    const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers();
    const emailMap: Record<string, string> = {};
    authUsers.forEach(u => {
      if (u.email) {
        emailMap[u.id] = u.email;
      }
    });

    // Create profiles for recruiters that don't have them
    const profilesToCreate = recruiterIds
      .filter(id => !existingProfileIds.has(id))
      .map(id => ({
        user_id: id,
        full_name: emailMap[id]?.split('@')[0] || 'Recruiter',
      }));

    let createdCount = 0;
    if (profilesToCreate.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert(profilesToCreate);

      if (insertError) {
        throw insertError;
      }
      createdCount = profilesToCreate.length;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Created ${createdCount} missing profiles`,
        created: createdCount
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error fixing recruiter profiles:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
