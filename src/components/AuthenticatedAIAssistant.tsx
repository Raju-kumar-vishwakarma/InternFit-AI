import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AIAssistant } from "./AIAssistant";
import type { User } from "@supabase/supabase-js";

export const AuthenticatedAIAssistant = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Only render AI Assistant if user is logged in
  if (!user) return null;

  return <AIAssistant />;
};
