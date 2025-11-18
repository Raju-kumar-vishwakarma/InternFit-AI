import { useEffect, useState } from "react";
import { Users, Briefcase, Database, Trash2, MapPin, Calendar, Eye, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddRecruiterDialog from "@/components/AddRecruiterDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminSidebar } from "./AdminSidebar";
import { ProfileSettingsContent } from "./ProfileSettingsContent";
import { useLocation } from "react-router-dom";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminDashboard = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'dashboard';
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeJobs: 0,
    totalApplications: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [selectedRecruiterPosts, setSelectedRecruiterPosts] = useState<any[]>([]);
  const [selectedRecruiterId, setSelectedRecruiterId] = useState<string | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [deleteRecruiterId, setDeleteRecruiterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    if (currentTab === 'recruiters') {
      fetchRecruiters();
    }
  }, [currentTab]);

  const fetchData = async () => {
    try {
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: jobsCount } = await supabase
        .from('job_postings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: appsCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true });

      const { data: users } = await supabase
        .from('profiles')
        .select('*, user_roles(role)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch all job postings
      const { data: postings } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch recruiter profiles separately
      const recruiterIds = postings?.map(p => p.recruiter_id) || [];
      const { data: recruiters } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', recruiterIds);

      // Merge recruiter info with postings
      const postingsWithRecruiters = postings?.map(posting => ({
        ...posting,
        recruiter_name: recruiters?.find(r => r.user_id === posting.recruiter_id)?.full_name || 'Unknown'
      })) || [];

      setStats({
        totalUsers: usersCount || 0,
        activeJobs: jobsCount || 0,
        totalApplications: appsCount || 0,
      });
      setRecentUsers(users || []);
      setJobPostings(postingsWithRecruiters);
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

  const handleDeleteJob = async () => {
    if (!deleteJobId) return;

    try {
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', deleteJobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job posting deleted successfully",
      });

      // Refresh data
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error deleting job",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteJobId(null);
    }
  };

  const fetchRecruiters = async () => {
    try {
      // First, try to fix any missing profiles
      await supabase.functions.invoke('fix-recruiter-profiles');
      
      // Then fetch the recruiters data
      const { data, error } = await supabase.functions.invoke('get-recruiters');

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setRecruiters(data.recruiters || []);
    } catch (error: any) {
      console.error("Error loading recruiters:", error);
      toast({
        title: "Error loading recruiters",
        description: error.message,
        variant: "destructive",
      });
      setRecruiters([]);
    }
  };

  const handleDeleteRecruiter = async () => {
    if (!deleteRecruiterId) return;

    try {
      // Delete user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', deleteRecruiterId)
        .eq('role', 'recruiter');

      if (roleError) throw roleError;

      toast({
        title: "Success",
        description: "Recruiter removed successfully",
      });

      // Refresh recruiters
      fetchRecruiters();
    } catch (error: any) {
      toast({
        title: "Error deleting recruiter",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteRecruiterId(null);
    }
  };

  const handleViewRecruiterPosts = async (recruiterId: string) => {
    try {
      const { data: posts } = await supabase
        .from('job_postings')
        .select('*')
        .eq('recruiter_id', recruiterId)
        .order('created_at', { ascending: false });

      setSelectedRecruiterPosts(posts || []);
      setSelectedRecruiterId(recruiterId);
    } catch (error: any) {
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderDashboardContent = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-primary-foreground/90">System overview and management controls</p>
          </div>
          <AddRecruiterDialog />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <div className="text-sm text-muted-foreground">Total Users</div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          <div className="text-2xl font-bold">{stats.activeJobs}</div>
          <div className="text-sm text-muted-foreground">Active Jobs</div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <div className="text-2xl font-bold">{stats.totalApplications}</div>
          <div className="text-sm text-muted-foreground">Applications</div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Users</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : recentUsers.length === 0 ? (
          <div className="bg-card rounded-xl p-12 text-center border border-border">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No users yet</h3>
            <p className="text-muted-foreground">Users will appear here after signup</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold">Name</th>
                  <th className="text-left p-4 font-semibold">Role</th>
                  <th className="text-left p-4 font-semibold">Location</th>
                  <th className="text-left p-4 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-t border-border">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-primary">{user.full_name?.[0] || 'U'}</span>
                        </div>
                        <div className="font-semibold">{user.full_name || 'Unknown'}</div>
                      </div>
                    </td>
                    <td className="p-4 capitalize">{user.user_roles?.[0]?.role || 'candidate'}</td>
                    <td className="p-4 text-muted-foreground">{user.location || 'N/A'}</td>
                    <td className="p-4 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Job Postings Management */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Job Postings</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : jobPostings.length === 0 ? (
          <div className="bg-card rounded-xl p-12 text-center border border-border">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No job postings yet</h3>
            <p className="text-muted-foreground">Job postings will appear here</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobPostings.map((job) => (
              <div key={job.id} className="bg-card rounded-xl p-6 shadow-lg border border-border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold">{job.title}</h3>
                        <p className="text-primary font-semibold">{job.company}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        job.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location || 'Remote'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Posted: {new Date(job.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Recruiter: {job.recruiter_name}
                      </div>
                    </div>

                    {job.description && (
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-4"
                    onClick={() => setDeleteJobId(job.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderRecruitersContent = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Recruiters</h1>
        <AddRecruiterDialog onRecruiterAdded={fetchRecruiters} />
      </div>

      {/* Recruiters Table */}
      <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Total Posts</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recruiters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No recruiters yet</h3>
                  <p className="text-muted-foreground">Add recruiters using the button above</p>
                </TableCell>
              </TableRow>
            ) : (
              recruiters.map((recruiter) => (
                <TableRow key={recruiter.user_id}>
                  <TableCell className="font-semibold">
                    {recruiter.full_name || 'N/A'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {recruiter.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {recruiter.location || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-primary">{recruiter.post_count}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRecruiterPosts(recruiter.user_id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Posts
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteRecruiterId(recruiter.user_id)}
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Recruiter Posts Modal */}
      {selectedRecruiterId && (
        <div className="mt-8 bg-card rounded-xl p-6 shadow-lg border border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              Recruiter's Job Postings ({selectedRecruiterPosts.length})
            </h2>
            <Button variant="ghost" onClick={() => {
              setSelectedRecruiterId(null);
              setSelectedRecruiterPosts([]);
            }}>
              Close
            </Button>
          </div>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {selectedRecruiterPosts.map((post) => (
                <div key={post.id} className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          <span>{post.company}</span>
                        </div>
                        {post.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{post.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Posted: {new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            post.status === 'active' 
                              ? 'bg-green-500/10 text-green-500' 
                              : 'bg-gray-500/10 text-gray-500'
                          }`}>
                            {post.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteJobId(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">
        {currentTab === 'dashboard' && renderDashboardContent()}
        {currentTab === 'users' && renderDashboardContent()}
        {currentTab === 'recruiters' && renderRecruitersContent()}
        {currentTab === 'profile' && <ProfileSettingsContent />}

        {/* Delete Job Confirmation Dialog */}
        <AlertDialog open={!!deleteJobId} onOpenChange={(open) => !open && setDeleteJobId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this job posting
                and remove all associated applications.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Recruiter Confirmation Dialog */}
        <AlertDialog open={!!deleteRecruiterId} onOpenChange={(open) => !open && setDeleteRecruiterId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the recruiter role from this user. Their posts will remain but they won't be able to create new ones.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteRecruiter} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Remove Recruiter
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
