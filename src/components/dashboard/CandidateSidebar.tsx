import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, Heart, ListChecks, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  icon: any;
  path?: string;
  onClick?: () => void;
}

export const CandidateSidebar = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      label: "Applied Internship",
      icon: Briefcase,
      path: "/dashboard?tab=applied",
    },
    {
      label: "Favorite Internship",
      icon: Heart,
      path: "/dashboard?tab=favorites",
    },
    {
      label: "Shortlisted",
      icon: ListChecks,
      path: "/dashboard?tab=shortlisted",
    },
    {
      label: "Feedback and Reviews",
      icon: MessageSquare,
      path: "/dashboard?tab=feedback",
    },
    {
      label: "Profile Settings",
      icon: Settings,
      path: "/dashboard?tab=profile",
    },
  ];

  const isItemActive = (itemPath: string) => {
    if (itemPath === location.pathname) return true;
    
    const itemParams = new URLSearchParams(itemPath.split('?')[1]);
    const itemTab = itemParams.get('tab');
    
    if (!itemTab && !currentTab && location.pathname === "/dashboard") {
      return true;
    }
    
    return itemTab === currentTab && location.pathname === "/dashboard";
  };

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen p-6">
      <div className="space-y-2">
        <h2 className="text-lg font-bold mb-6">Candidate Dashboard</h2>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path ? isItemActive(item.path) : false;

          return (
            <Link key={item.label} to={item.path || "#"}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
