import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Briefcase, Heart, Settings, Trash2, Search, MapPin, X } from "lucide-react";
import ApplicationDialog from "@/components/ApplicationDialog";
import { ApplicationDetailsModal } from "@/components/ApplicationDetailsModal";
import { ApplicationStatusModal } from "@/components/ApplicationStatusModal";
import { useToast } from "@/hooks/use-toast";
import ResumeInformation from "./ResumeInformation";
import ResumeScore from "./ResumeScore";
import { CandidateSidebar } from "./CandidateSidebar";
import { ProfileSettingsContent } from "./ProfileSettingsContent";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Resume {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  skills: string[] | null;
  experience: string | null;
  education: string | null;
  extracted_text: string | null;
}

interface Recommendation {
  id: string;
  title: string;
  company: string;
  match_score: number;
  location: string;
  internship_type: string;
}

interface Application {
  id: string;
  status: string;
  applied_at: string;
  cover_letter: string | null;
  job_postings?: {
    title: string;
    company: string;
    location: string | null;
  };
  internship_recommendations?: {
    title: string;
    company: string;
    location: string | null;
  };
}

const CandidateDashboard = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedStatusApp, setSelectedStatusApp] = useState<{ id: string; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "dashboard";

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: resumesData } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (resumesData) setResumes(resumesData);

      const { data: recsData } = await supabase
        .from('internship_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('match_score', { ascending: false })
        .limit(6);

      if (recsData) setRecommendations(recsData);

      const { data: appsData } = await supabase
        .from('applications')
        .select(`
          *,
          job_postings(title, company, location),
          internship_recommendations(title, company, location)
        `)
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      if (appsData) setApplications(appsData);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleDeleteResume = async (resumeId: string) => {
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);

      if (error) throw error;

      setResumes(resumes.filter(r => r.id !== resumeId));
      toast({
        title: "Resume deleted",
        description: "Your resume has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteApplication = async () => {
    if (!deleteAppId) return;
    
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', deleteAppId);

      if (error) throw error;

      setApplications(applications.filter(a => a.id !== deleteAppId));
      toast({
        title: "Application withdrawn",
        description: "Your application has been withdrawn successfully.",
      });
      setDeleteAppId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      pending: { label: "Current Status", variant: "default" },
      reviewed: { label: "Current Status", variant: "default" },
      interview: { label: "Current Status", variant: "default" },
      hired: { label: "Shortlisted", variant: "secondary" },
      accepted: { label: "Shortlisted", variant: "secondary" },
      rejected: { label: "Rejected", variant: "destructive" },
    };
    return statusMap[status] || { label: "Current Status", variant: "default" };
  };

  const getCompanyInitial = (company: string) => {
    return company.charAt(0).toUpperCase();
  };

  const getCompanyColor = (company: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-cyan-500",
    ];
    const index = company.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const filteredApplications = applications.filter((app) => {
    const title = app.job_postings?.title || app.internship_recommendations?.title || "";
    const company = app.job_postings?.company || app.internship_recommendations?.company || "";
    const location = app.job_postings?.location || app.internship_recommendations?.location || "";

    const matchesSearch = 
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = !locationFilter || 
      location?.toLowerCase().includes(locationFilter.toLowerCase());

    if (currentTab === "shortlisted") {
      return matchesSearch && matchesLocation && (app.status === "hired" || app.status === "accepted");
    }

    return matchesSearch && matchesLocation;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <CandidateSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboardContent = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
        <p className="text-muted-foreground">
          Track your applications and manage your resumes
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{resumes.length}</div>
              <div className="text-sm text-muted-foreground">Resumes</div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{recommendations.length}</div>
              <div className="text-sm text-muted-foreground">Matches</div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{favorites.length}</div>
              <div className="text-sm text-muted-foreground">Favorites</div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Settings className="w-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{applications.length}</div>
              <div className="text-sm text-muted-foreground">Applied</div>
            </div>
          </div>
        </div>
      </div>

      {resumes.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Your Profile Score</h3>
          <ResumeScore resume={resumes[0]} />
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Applications</h3>
        {applications.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No applications yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start applying to internships to see them here
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {applications.slice(0, 5).map((app) => (
              <div
                key={app.id}
                className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {app.job_postings?.title || app.internship_recommendations?.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {app.job_postings?.company || app.internship_recommendations?.company}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Applied on {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={getStatusBadge(app.status).variant}>
                      {getStatusBadge(app.status).label}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStatusApp({ id: app.id, status: app.status })}
                    >
                      View Status
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Resumes</h3>
        {resumes.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No resumes uploaded</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {resumes.map((resume) => (
              <AccordionItem key={resume.id} value={resume.id}>
                <AccordionTrigger>
                  <div className="flex items-center justify-between w-full pr-4">
                    <span>{resume.file_name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(resume.file_url, '_blank');
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResume(resume.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ResumeInformation resume={resume} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Top Recommendations</h3>
        {recommendations.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <p className="text-muted-foreground">No recommendations yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground">{rec.company}</p>
                  </div>
                  <Badge variant="secondary">{rec.match_score}% Match</Badge>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-muted-foreground">{rec.location}</p>
                  <p className="text-sm text-muted-foreground">{rec.internship_type}</p>
                </div>
                <ApplicationDialog 
                  recommendationId={rec.id} 
                  jobTitle={rec.title}
                  company={rec.company}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAppliedInternships = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Applied Internships</h2>
        <p className="text-muted-foreground">Track all your applications</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by job title or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-64 relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No applications found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((app) => {
            const company = app.job_postings?.company || app.internship_recommendations?.company || "";
            const title = app.job_postings?.title || app.internship_recommendations?.title || "";
            const location = app.job_postings?.location || app.internship_recommendations?.location || "";
            
            return (
              <div
                key={app.id}
                className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <Avatar className={`h-12 w-12 ${getCompanyColor(company)}`}>
                    <AvatarFallback className="text-white font-bold">
                      {getCompanyInitial(company)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{title}</h4>
                        <p className="text-sm text-muted-foreground">{company}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                            Full Time
                          </Badge>
                          {location && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {location}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(app.applied_at), "MMM d, yyyy")}
                          </p>
                          <Badge
                            variant={getStatusBadge(app.status).variant}
                            className={
                              app.status === "hired" || app.status === "accepted"
                                ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                : app.status === "rejected"
                                ? ""
                                : "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20"
                            }
                          >
                            {getStatusBadge(app.status).label}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteAppId(app.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setSelectedStatusApp({ id: app.id, status: app.status })}
                    >
                      View Status
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Favorite Internships</h2>
        <p className="text-muted-foreground">Your saved opportunities ({favorites.length})</p>
      </div>
      {favorites.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No favorites yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {favorites.map((fav) => {
            const job = fav.job_postings || fav.internship_recommendations;
            return (
              <div key={fav.id} className="bg-card rounded-lg p-6 border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className={getCompanyColor(job.company)}>
                        {job.company.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-muted-foreground">{job.company}</p>
                      {job.location && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{job.location}</p>}
                    </div>
                  </div>
                  <ApplicationDialog
                    recommendationId={fav.recommendation_id}
                    jobPostingId={fav.job_posting_id}
                    jobTitle={job.title}
                    company={job.company}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderFeedback = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Feedback and Reviews</h2>
        <p className="text-muted-foreground">Your feedback from recruiters</p>
      </div>
      <div className="text-center py-12 bg-card rounded-lg border">
        <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No feedback yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Feedback will appear here once provided
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <CandidateSidebar />
      <div className="flex-1 p-8">
        {currentTab === "dashboard" && renderDashboardContent()}
        {currentTab === "applied" && renderAppliedInternships()}
        {currentTab === "favorites" && renderFavorites()}
        {currentTab === "shortlisted" && renderAppliedInternships()}
        {currentTab === "feedback" && renderFeedback()}
        {currentTab === "profile" && <ProfileSettingsContent />}

        <ApplicationDetailsModal
          applicationId={selectedApplicationId}
          open={!!selectedApplicationId}
          onOpenChange={(open) => !open && setSelectedApplicationId(null)}
        />

        <ApplicationStatusModal
          applicationId={selectedStatusApp?.id || null}
          status={selectedStatusApp?.status || ""}
          open={!!selectedStatusApp}
          onOpenChange={(open) => !open && setSelectedStatusApp(null)}
        />

        <AlertDialog open={!!deleteAppId} onOpenChange={(open) => !open && setDeleteAppId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Withdraw Application?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to withdraw this application? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteApplication} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Withdraw
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default CandidateDashboard;
