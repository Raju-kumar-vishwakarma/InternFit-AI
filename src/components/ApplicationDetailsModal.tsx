import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2,
  MapPin,
  Calendar,
  FileText,
  MessageSquare,
  Clock,
  CheckCircle2,
  Download,
} from "lucide-react";

interface ApplicationDetailsModalProps {
  applicationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface JobDetails {
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  requirements?: string | null;
  job_type?: string | null;
  salary_range?: string | null;
}

interface StatusHistory {
  id: string;
  status: string;
  notes: string | null;
  changed_at: string;
}

interface ApplicationDetails {
  status: string;
  cover_letter: string | null;
  applied_at: string;
  recruiter_notes: string | null;
  user_id: string;
  job_postings?: JobDetails;
  internship_recommendations?: JobDetails;
}

interface Resume {
  id: string;
  file_name: string;
  file_url: string;
  skills: string[] | null;
  experience: string | null;
  education: string | null;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  phone: string | null;
  location: string | null;
}

export const ApplicationDetailsModal = ({
  applicationId,
  open,
  onOpenChange,
}: ApplicationDetailsModalProps) => {
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (applicationId && open) {
      fetchApplicationDetails();
    }
  }, [applicationId, open]);

  const fetchApplicationDetails = async () => {
    if (!applicationId) return;
    
    setLoading(true);
    try {
      // Fetch application with job details
      const { data: appData } = await supabase
        .from("applications")
        .select(`
          *,
          job_postings(title, company, location, description, requirements, job_type, salary_range),
          internship_recommendations(title, company, location, description)
        `)
        .eq("id", applicationId)
        .single();

      if (appData) {
        setApplication(appData);
        
        // Fetch candidate's resume
        const { data: resumeData } = await supabase
          .from("resumes")
          .select("*")
          .eq("user_id", appData.user_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (resumeData) {
          setResume(resumeData);
        }

        // Fetch candidate's profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, phone, location")
          .eq("user_id", appData.user_id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }
      }

      // Fetch status history
      const { data: historyData } = await supabase
        .from("application_status_history")
        .select("*")
        .eq("application_id", applicationId)
        .order("changed_at", { ascending: false });

      if (historyData) {
        setStatusHistory(historyData);
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "reviewed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "interview":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "accepted":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (!application) {
    return null;
  }

  const jobDetails = application.job_postings || application.internship_recommendations;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Application Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
          <div className="space-y-6">
            {/* Job Information */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {jobDetails?.title || "Position"}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {jobDetails?.company || "Company"}
                    </div>
                    {jobDetails?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {jobDetails.location}
                      </div>
                    )}
                    {application.job_postings?.job_type && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {application.job_postings.job_type}
                      </div>
                    )}
                  </div>
                </div>
                <Badge className={`${getStatusColor(application.status)} capitalize`}>
                  {application.status}
                </Badge>
              </div>

              {application.job_postings?.salary_range && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Salary Range</p>
                  <p className="text-sm">{application.job_postings.salary_range}</p>
                </div>
              )}

              {jobDetails?.description && (
                <div>
                  <p className="text-sm font-medium mb-2">Job Description</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {jobDetails.description}
                  </p>
                </div>
              )}

              {application.job_postings?.requirements && (
                <div>
                  <p className="text-sm font-medium mb-2">Requirements</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {application.job_postings.requirements}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Application Timeline */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Application Timeline
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 pl-1">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Application Submitted</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(application.applied_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your application was received
                    </p>
                  </div>
                </div>

                {statusHistory.map((history) => (
                  <div key={history.id} className="flex items-start gap-3 pl-1">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          Status: {history.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(history.changed_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {history.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {history.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {application.cover_letter && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Cover Letter
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-line text-foreground">
                      {application.cover_letter}
                    </p>
                  </div>
                </div>
              </>
            )}

            {application.recruiter_notes && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Recruiter Feedback
                  </h4>
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-line text-foreground">
                      {application.recruiter_notes}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
