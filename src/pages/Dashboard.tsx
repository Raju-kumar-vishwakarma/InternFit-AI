import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useUserRole } from "@/hooks/useUserRole";
import CandidateDashboard from "@/components/dashboard/CandidateDashboard";
import RecruiterDashboard from "@/components/dashboard/RecruiterDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/');
      return;
    }

    setUser(user);
    setLoading(false);
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {role === 'candidate' && <CandidateDashboard />}
        {role === 'recruiter' && <RecruiterDashboard />}
        {role === 'admin' && <AdminDashboard />}
        {!role && (
          <div className="text-center py-20">
            <p className="text-gray-text">Loading your dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
