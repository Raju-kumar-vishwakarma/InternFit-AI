import { useEffect, useState } from "react";
import { Users, FileText, TrendingUp, Clock, Plus, Search, Pencil, UserCheck, UserX, CheckCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import JobPostingDialog from "@/components/JobPostingDialog";
import { ApplicationDetailsModal } from "@/components/ApplicationDetailsModal";
import { RecruiterSidebar } from "./RecruiterSidebar";
import { ProfileSettingsContent } from "./ProfileSettingsContent";
import { useLocation } from "react-router-dom";

const RecruiterDashboard = () => {
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'dashboard';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch recruiter's job postings
      const { data: postings, error: postingsError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false });

      if (postingsError) throw postingsError;
      setJobPostings(postings || []);

      // Fetch applications for recruiter's job postings
      const { data: apps, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          job_postings!inner(title, company, recruiter_id)
        `)
        .eq('job_postings.recruiter_id', user.id)
        .order('applied_at', { ascending: false });

      if (appsError) throw appsError;

      // Fetch profiles separately for applicants
      const userIds = apps?.map(app => app.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      // Merge profiles with applications
      const appsWithProfiles = apps?.map(app => ({
        ...app,
        profiles: profilesData?.find(p => p.user_id === app.user_id) || null
      })) || [];

      setApplications(appsWithProfiles);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPostings = jobPostings.filter(post =>
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApplications = selectedJobId 
    ? applications.filter(app => app.job_posting_id === selectedJobId)
    : applications;

  const handleHireCandidate = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'hired' })
        .eq('id', applicationId);

      if (error) throw error;

      // Create status history entry
      await supabase
        .from('application_status_history')
        .insert({
          application_id: applicationId,
          status: 'hired',
          notes: 'Candidate hired by recruiter'
        });

      toast({
        title: "Candidate hired!",
        description: "The candidate has been marked as hired",
      });

      fetchData(); // Refresh the data
    } catch (error: any) {
      toast({
        title: "Error hiring candidate",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUnhireCandidate = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'pending' })
        .eq('id', applicationId);

      if (error) throw error;

      // Create status history entry
      await supabase
        .from('application_status_history')
        .insert({
          application_id: applicationId,
          status: 'pending',
          notes: 'Candidate unhired by recruiter'
        });

      toast({
        title: "Candidate status updated",
        description: "The candidate has been moved back to pending",
      });

      fetchData(); // Refresh the data
    } catch (error: any) {
      toast({
        title: "Error updating candidate status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRejectCandidate = async (applicationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;

      // Create status history entry
      await supabase
        .from('application_status_history')
        .insert({
          application_id: applicationId,
          status: 'rejected',
          notes: 'Application rejected by recruiter'
        });

      // Send notification message to the applicant
      await supabase
        .from('application_queries')
        .insert({
          application_id: applicationId,
          sender_id: user.id,
          sender_type: 'recruiter',
          message: 'Thank you for your interest. After careful consideration, we have decided to move forward with other candidates at this time. We appreciate the time you invested in the application process and wish you the best in your job search.'
        });

      toast({
        title: "Application rejected",
        description: "The candidate has been notified of the decision",
      });

      fetchData(); // Refresh the data
    } catch (error: any) {
      toast({
        title: "Error rejecting application",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const stats = {
    activePostings: jobPostings.filter(p => p.status === 'active').length,
    totalApplicants: applications.length,
    pendingReview: applications.filter(a => a.status === 'pending').length,
    shortlisted: applications.filter(a => a.status === 'hired').length,
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <RecruiterSidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-8">
        {/* Dashboard Tab */}
        {currentTab === 'dashboard' && (
          <>
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                  <p className="text-primary-foreground/90">Manage your job postings and find the perfect candidates</p>
                </div>
                <JobPostingDialog />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{stats.totalApplicants}+</div>
                    <div className="text-sm text-muted-foreground">APPLICATIONS</div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{stats.activePostings}+</div>
                    <div className="text-sm text-muted-foreground">TOTAL POSTS</div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{stats.shortlisted}+</div>
                    <div className="text-sm text-muted-foreground">Shortlisted</div>
                  </div>
                </div>
              </div>
            </div>

            {/* My Job Postings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">My Job Postings</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-text" />
                  <Input 
                    placeholder="Search postings..." 
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : filteredPostings.length === 0 ? (
                <div className="bg-card rounded-xl p-12 text-center border border-border">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No job postings yet</h3>
                  <p className="text-muted-foreground mb-4">Start by posting your first job</p>
                  <JobPostingDialog />
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredPostings.map((posting) => (
                    <div key={posting.id} className="bg-card rounded-xl p-6 shadow-lg border border-border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{posting.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              posting.status === 'active' 
                                ? 'bg-green-500/10 text-green-500' 
                                : 'bg-gray-500/10 text-gray-500'
                            }`}>
                              {posting.status}
                            </span>
                          </div>
                          <p className="text-muted-foreground mb-2">{posting.company}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            {posting.location && <span>📍 {posting.location}</span>}
                            {posting.job_type && <span>💼 {posting.job_type}</span>}
                            {posting.salary_range && <span>💰 {posting.salary_range}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary mb-1">
                            {applications.filter(a => a.job_posting_id === posting.id).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Applications</div>
                        </div>
                      </div>
                      {posting.description && (
                        <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{posting.description}</p>
                      )}
                      <div className="mt-4 flex gap-2">
                        <JobPostingDialog 
                          existingPosting={posting}
                          onSuccess={fetchData}
                          trigger={
                            <Button size="sm" variant="outline" className="gap-2">
                              <Pencil className="w-4 h-4" />
                              Edit
                            </Button>
                          }
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedJobId(posting.id);
                            setIsJobDetailsOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedJobId(posting.id);
                            // Scroll to applicants section
                            const applicantsSection = document.querySelector('#applicants-section');
                            applicantsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                        >
                          View Applicants ({applications.filter(a => a.job_posting_id === posting.id).length})
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Applications */}
            {applications.length > 0 && (
              <div id="applicants-section">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">
                    {selectedJobId ? 'Job Applicants' : 'All Applicants'}
                  </h2>
                  {selectedJobId && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedJobId(null)}
                    >
                      Show All Applicants
                    </Button>
                  )}
                </div>
                <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="text-left p-4 font-semibold">Applicants</th>
                          <th className="text-left p-4 font-semibold">Posts</th>
                          <th className="text-left p-4 font-semibold">Applied Date</th>
                          <th className="text-left p-4 font-semibold">Status</th>
                          <th className="text-left p-4 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplications.slice(0, 10).map((app) => (
                          <tr key={app.id} className="border-t border-border hover:bg-muted/20">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                  <span className="font-semibold text-foreground">
                                    {app.profiles?.full_name?.[0] || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-semibold">{app.profiles?.full_name || 'Unknown'}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {app.profiles?.gender || 'Not specified'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-foreground">{app.job_postings?.title}</td>
                            <td className="p-4 text-muted-foreground">
                              {new Date(app.applied_at).toLocaleDateString('en-GB', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </td>
                            <td className="p-4">
                              <span className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                                app.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                                app.status === 'hired' ? 'bg-green-100 text-green-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {app.status === 'hired' ? 'Selected' : app.status === 'pending' ? 'Pending' : app.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedApplicationId(app.id);
                                    setIsModalOpen(true);
                                  }}
                                  className="gap-1"
                                >
                                  View Details
                                  <span className="text-muted-foreground">⊙</span>
                                </Button>
                                {app.status === 'hired' ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUnhireCandidate(app.id)}
                                    className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                  >
                                    <UserX className="w-4 h-4" />
                                    Unhire
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleHireCandidate(app.id)}
                                    className="gap-2 text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                    Hire
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Post Application Tab */}
        {currentTab === 'post' && (
          <div>
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-8 mb-8">
              <h1 className="text-3xl font-bold mb-2">Post New Application</h1>
              <p className="text-primary-foreground/90">Create a new job posting to attract top talent</p>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border">
              <JobPostingDialog 
                trigger={
                  <Button size="lg" className="w-full">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Job Posting
                  </Button>
                }
              />
            </div>
          </div>
        )}

        {/* Pending Applications Tab */}
        {currentTab === 'pending' && (
          <div>
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-8 mb-8">
              <h1 className="text-3xl font-bold mb-2">Pending Applications</h1>
              <p className="text-primary-foreground/90">Review applications waiting for your decision</p>
            </div>
            {applications.filter(app => app.status === 'pending').length === 0 ? (
              <div className="bg-card rounded-xl p-12 text-center border border-border">
                <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No pending applications</h3>
                <p className="text-muted-foreground">All applications have been reviewed</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left p-4 font-semibold">Applicants</th>
                        <th className="text-left p-4 font-semibold">Posts</th>
                        <th className="text-left p-4 font-semibold">Applied Date</th>
                        <th className="text-left p-4 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.filter(app => app.status === 'pending').map((app) => (
                        <tr key={app.id} className="border-t border-border hover:bg-muted/20">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                <span className="font-semibold text-foreground">
                                  {app.profiles?.full_name?.[0] || 'U'}
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold">{app.profiles?.full_name || 'Unknown'}</div>
                                <div className="text-xs text-muted-foreground">
                                  {app.profiles?.gender || 'Not specified'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-foreground">{app.job_postings?.title}</td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(app.applied_at).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedApplicationId(app.id);
                                  setIsModalOpen(true);
                                }}
                                className="gap-1"
                              >
                                View Details
                                <span className="text-muted-foreground">⊙</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleHireCandidate(app.id)}
                                className="gap-2 text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                              >
                                <UserCheck className="w-4 h-4" />
                                Hire
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectCandidate(app.id)}
                                className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                              >
                                <UserX className="w-4 h-4" />
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shortlisted Applications Tab */}
        {currentTab === 'shortlisted' && (
          <div>
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-8 mb-8">
              <h1 className="text-3xl font-bold mb-2">Shortlisted Applications</h1>
              <p className="text-primary-foreground/90">Candidates you've selected for the position</p>
            </div>
            {applications.filter(app => app.status === 'hired').length === 0 ? (
              <div className="bg-card rounded-xl p-12 text-center border border-border">
                <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No shortlisted candidates</h3>
                <p className="text-muted-foreground">Start reviewing applications to shortlist candidates</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left p-4 font-semibold">Applicants</th>
                        <th className="text-left p-4 font-semibold">Posts</th>
                        <th className="text-left p-4 font-semibold">Applied Date</th>
                        <th className="text-left p-4 font-semibold">Status</th>
                        <th className="text-left p-4 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.filter(app => app.status === 'hired').map((app) => (
                        <tr key={app.id} className="border-t border-border hover:bg-muted/20">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                <span className="font-semibold text-foreground">
                                  {app.profiles?.full_name?.[0] || 'U'}
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold">{app.profiles?.full_name || 'Unknown'}</div>
                                <div className="text-xs text-muted-foreground">
                                  {app.profiles?.gender || 'Not specified'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-foreground">{app.job_postings?.title}</td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(app.applied_at).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </td>
                          <td className="p-4">
                            <span className="px-4 py-1.5 rounded-md text-sm font-medium bg-green-100 text-green-600">
                              Selected
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedApplicationId(app.id);
                                  setIsModalOpen(true);
                                }}
                                className="gap-1"
                              >
                                View Details
                                <span className="text-muted-foreground">⊙</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnhireCandidate(app.id)}
                                className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                              >
                                <UserX className="w-4 h-4" />
                                Unhire
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback and Reviews Tab */}
        {currentTab === 'feedback' && (
          <div>
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-8 mb-8">
              <h1 className="text-3xl font-bold mb-2">Feedback and Reviews</h1>
              <p className="text-primary-foreground/90">View feedback from candidates and manage reviews</p>
            </div>
            <div className="bg-card rounded-xl p-12 text-center border border-border">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Feedback Section</h3>
              <p className="text-muted-foreground">This feature is coming soon</p>
            </div>
          </div>
        )}

        {/* Profile Settings Tab */}
        {currentTab === 'profile' && <ProfileSettingsContent />}

        {/* Application Details Modal */}
        <ApplicationDetailsModal 
          applicationId={selectedApplicationId}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />

        {/* Job Details Dialog */}
        {selectedJobId && (
          <Dialog open={isJobDetailsOpen} onOpenChange={setIsJobDetailsOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Job Posting Details</DialogTitle>
              </DialogHeader>
              {(() => {
                const job = jobPostings.find(j => j.id === selectedJobId);
                if (!job) return null;
                return (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-muted-foreground">{job.company}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {job.location && (
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{job.location}</p>
                        </div>
                      )}
                      {job.job_type && (
                        <div>
                          <p className="text-sm text-muted-foreground">Job Type</p>
                          <p className="font-medium">{job.job_type}</p>
                        </div>
                      )}
                      {job.salary_range && (
                        <div>
                          <p className="text-sm text-muted-foreground">Salary Range</p>
                          <p className="font-medium">{job.salary_range}</p>
                        </div>
                      )}
                      {job.deadline && (
                        <div>
                          <p className="text-sm text-muted-foreground">Deadline</p>
                          <p className="font-medium">{new Date(job.deadline).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    {job.description && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Description</p>
                        <p className="text-sm">{job.description}</p>
                      </div>
                    )}

                    {job.requirements && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Requirements</p>
                        <p className="text-sm">{job.requirements}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          job.status === 'active' 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-gray-500/10 text-gray-500'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Applications</p>
                        <p className="text-2xl font-bold text-primary">
                          {applications.filter(a => a.job_posting_id === job.id).length}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;