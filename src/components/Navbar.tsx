import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { NavLink } from "./NavLink"; // Aapka custom NavLink component
import AuthDialog from "./AuthDialog";
import { useUserRole } from "@/hooks/useUserRole";
import logo from "../assests/logo.png";


const Navbar = () => {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const { role, user, loading } = useUserRole();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/"); // Sign out ke baad home bhej de
  };
 
  return (
    <>
      <nav className="w-full bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo Section */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center overflow-hidden">
              <img src={logo} alt="InternFit Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">InternFit</span>
              <span className="text-xs text-muted-foreground">AI Powered Engine</span>
            </div>
          </div>
          
          {/* --- Navigation Links (FIXED) --- */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink 
              to="/" 
              className="text-foreground hover:text-primary font-medium transition-colors"
              activeClassName="text-primary font-semibold"
            >
              Home
            </NavLink>
            <NavLink 
              to="/programs" 
              className="text-foreground hover:text-primary font-medium transition-colors"
              activeClassName="text-primary font-semibold"
            >
              Programs
            </NavLink>
            <NavLink 
              to="/internships" 
              className="text-foreground hover:text-primary font-medium transition-colors"
              activeClassName="text-primary font-semibold"
            >
              Internship
            </NavLink>
            <NavLink 
              to="/insights" 
              className="text-foreground hover:text-primary font-medium transition-colors"
              activeClassName="text-primary font-semibold"
            >
              Insights
            </NavLink>

            
            {!loading && user && (
              <NavLink 
                to="/dashboard" 
                className="text-foreground hover:text-primary font-medium transition-colors"
                activeClassName="text-primary font-semibold"
              >
                Dashboard
              </NavLink>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-10 w-24 bg-muted animate-pulse rounded-full" />
            ) : user ? (
              <Button onClick={handleSignOut} variant="outline" className="rounded-full px-6 font-semibold">
                Sign Out
              </Button>
            ) : (
              <Button onClick={() => setAuthOpen(true)} className="rounded-full px-6 font-semibold">
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};

export default Navbar;