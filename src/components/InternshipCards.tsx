import { useEffect, useState } from "react";
import { MapPin, Search, Filter, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ApplicationDialog from "@/components/ApplicationDialog";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string | null;
  job_type: string | null;
  requirements: string | null;
  description: string | null;
  salary_range: string | null;
}

interface InternshipCardsProps {
  searchQuery?: {
    jobQuery: string;
    locationQuery: string;
  };
  // Added this prop to handle clearing the search
  onClearSearch?: () => void;
}

const InternshipCards = ({ searchQuery, onClearSearch }: InternshipCardsProps) => {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchSuggestion, setSearchSuggestion] = useState<string>("");
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [availableJobTypes, setAvailableJobTypes] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const { role } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobPostings = async () => {
      setLoading(true);
      setSearchSuggestion("");

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userApplications } = await supabase
            .from('applications')
            .select('job_posting_id')
            .eq('user_id', user.id);
          
          if (userApplications) {
            const appliedJobIds = new Set(
              userApplications
                .map(app => app.job_posting_id)
                .filter(id => id !== null) as string[]
            );
            setAppliedJobs(appliedJobIds);
          }
        }

        let query = supabase
          .from('job_postings')
          .select('*')
          .eq('status', 'active');

        if (searchQuery && (searchQuery.jobQuery || searchQuery.locationQuery)) {
          const { jobQuery, locationQuery } = searchQuery;
          
          if (jobQuery) {
            const searchTerm = `%${jobQuery.toLowerCase()}%`;
            query = query.or(`title.ilike.${searchTerm},company.ilike.${searchTerm},description.ilike.${searchTerm},requirements.ilike.${searchTerm}`);
          }

          if (locationQuery) {
            const locTerm = `%${locationQuery.toLowerCase()}%`;
            query = query.ilike('location', locTerm);
          }
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const jobTypes = [...new Set(data.map(job => job.job_type).filter(Boolean))] as string[];
          const locations = [...new Set(data.map(job => job.location).filter(Boolean))] as string[];
          setAvailableJobTypes(jobTypes);
          setAvailableLocations(locations);

          let filteredData = data;
          
          if (selectedJobTypes.length > 0) {
            filteredData = filteredData.filter(job => 
              job.job_type && selectedJobTypes.includes(job.job_type)
            );
          }
          
          if (selectedLocations.length > 0) {
            filteredData = filteredData.filter(job => 
              job.location && selectedLocations.includes(job.location)
            );
          }

          setJobPostings(filteredData);
          
          if (filteredData.length === 0 && searchQuery && (searchQuery.jobQuery || searchQuery.locationQuery)) {
            const { data: fuzzyData, error: fuzzyError } = await supabase.functions.invoke('fuzzy-search', {
              body: { 
                jobQuery: searchQuery.jobQuery,
                locationQuery: searchQuery.locationQuery
              }
            });

            if (!fuzzyError && fuzzyData?.suggestion) {
              setSearchSuggestion(fuzzyData.suggestion);
              toast({
                title: "No exact matches found",
                description: `Did you mean: "${fuzzyData.suggestion}"?`,
              });
            }
          }
        }
      } catch (error: any) {
        console.error('Error fetching jobs:', error);
        toast({
          title: "Error loading jobs",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobPostings();
  }, [searchQuery, selectedJobTypes, selectedLocations]);

  if (loading) {
    return (
      <section className="w-full py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-text">Loading job postings...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 bg-muted/30" id="search-results">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {searchQuery ? 'Search Results' : 'Latest Job Postings'}
          </h2>
          
          {/* SEARCH TAGS AND CLEAR ICON */}
          {searchQuery && (searchQuery.jobQuery || searchQuery.locationQuery) && (
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <span className="text-muted-foreground">Searching for:</span>
              
              {searchQuery.jobQuery && (
                <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-medium">
                  <Search className="w-4 h-4" />
                  {searchQuery.jobQuery}
                </span>
              )}
              
              {searchQuery.locationQuery && (
                <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-medium">
                  <MapPin className="w-4 h-4" />
                  {searchQuery.locationQuery}
                </span>
              )}

              {/* --- CLEAR ICON ADDED HERE --- */}
              {onClearSearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClearSearch}
                  className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                  title="Clear Search"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          )}
          
          <p className="text-gray-text text-lg">
            {searchQuery ? `Found ${jobPostings.length} ${jobPostings.length === 1 ? 'job' : 'jobs'}` : 'Explore opportunities from top companies'}
          </p>
          
          {searchSuggestion && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg inline-block">
              <p className="text-primary text-sm">
                💡 Did you mean: <span className="font-semibold">"{searchSuggestion}"</span>?
              </p>
            </div>
          )}
        </div>

        {/* Job Listings (No changes below this point) */}
        {jobPostings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-text text-lg">
              {searchQuery ? 'No jobs match your search. Try different keywords.' : 'No job postings available at the moment.'}
            </p>
            {onClearSearch && searchQuery && (
               <Button variant="outline" onClick={onClearSearch} className="mt-4">
                 Clear Filters & Show All
               </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Latest <span className="text-primary">Internships/Jobs</span>
                </h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="w-4 h-4" />
                      Filter
                      {(selectedJobTypes.length > 0 || selectedLocations.length > 0) && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                          {selectedJobTypes.length + selectedLocations.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Job Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {availableJobTypes.map((type) => (
                      <DropdownMenuCheckboxItem
                        key={type}
                        checked={selectedJobTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          setSelectedJobTypes(
                            checked
                              ? [...selectedJobTypes, type]
                              : selectedJobTypes.filter((t) => t !== type)
                          );
                        }}
                      >
                        {type}
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Location</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {availableLocations.map((location) => (
                      <DropdownMenuCheckboxItem
                        key={location}
                        checked={selectedLocations.includes(location)}
                        onCheckedChange={(checked) => {
                          setSelectedLocations(
                            checked
                              ? [...selectedLocations, location]
                              : selectedLocations.filter((l) => l !== location)
                          );
                        }}
                      >
                        {location}
                      </DropdownMenuCheckboxItem>
                    ))}
                    {(selectedJobTypes.length > 0 || selectedLocations.length > 0) && (
                      <>
                        <DropdownMenuSeparator />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-center"
                          onClick={() => {
                            setSelectedJobTypes([]);
                            setSelectedLocations([]);
                          }}
                        >
                          Clear All
                        </Button>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {(selectedJobTypes.length > 0 || selectedLocations.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {selectedJobTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="gap-1">
                      {type}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setSelectedJobTypes(selectedJobTypes.filter((t) => t !== type))}
                      />
                    </Badge>
                  ))}
                  {selectedLocations.map((location) => (
                    <Badge key={location} variant="secondary" className="gap-1">
                      <MapPin className="w-3 h-3" />
                      {location}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setSelectedLocations(selectedLocations.filter((l) => l !== location))}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {jobPostings.slice(0, 8).map((job) => {
                  const requirements = job.requirements?.split(',').slice(0, 2) || [];
                  const isApplied = appliedJobs.has(job.id);
                  
                  return (
                    <div key={job.id} className="bg-card rounded-xl p-5 border border-border hover:shadow-lg transition-all flex flex-col h-full">
                      <div className="mb-4">
                        <h3 className="font-bold text-base mb-1">{job.title}</h3>
                        <p className="text-muted-foreground text-sm">{requirements.join(', ')}</p>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        {job.job_type && (
                          <span className="bg-green-500/10 text-green-600 text-xs px-3 py-1 rounded font-medium">
                            {job.job_type}
                          </span>
                        )}
                        {job.salary_range && (
                          <span className="text-muted-foreground text-xs">
                            Stipend: {job.salary_range}
                          </span>
                        )}
                      </div>

                      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-border">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {job.company.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-primary">{job.company}</p>
                          {job.location && (
                            <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{job.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {role !== 'admin' && (
                        <div className="mt-auto">
                          <ApplicationDialog
                            jobPostingId={job.id}
                            jobTitle={job.title}
                            company={job.company}
                            hasApplied={isApplied}
                            onApplicationSuccess={() => {
                              setAppliedJobs(prev => new Set([...prev, job.id]));
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* More Internships Section */}
            {jobPostings.length > 8 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    More <span className="text-primary">Internships/Jobs</span>
                  </h2>
                  <Button variant="outline" className="rounded-full">
                    See All
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {jobPostings.slice(8).map((job) => {
                    const requirements = job.requirements?.split(',').slice(0, 2) || [];
                    const isApplied = appliedJobs.has(job.id);
                    
                    return (
                      <div key={job.id} className="bg-card rounded-xl p-5 border border-border hover:shadow-lg transition-all flex flex-col h-full">
                        <div className="mb-4">
                          <h3 className="font-bold text-base mb-1">{job.title}</h3>
                          <p className="text-muted-foreground text-sm">{requirements.join(', ')}</p>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          {job.job_type && (
                            <span className="bg-green-500/10 text-green-600 text-xs px-3 py-1 rounded font-medium">
                              {job.job_type}
                            </span>
                          )}
                          {job.salary_range && (
                            <span className="text-muted-foreground text-xs">
                              Stipend: {job.salary_range}
                            </span>
                          )}
                        </div>

                        <div className="flex items-start gap-3 mb-4 pb-4 border-b border-border">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {job.company.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-primary">{job.company}</p>
                            {job.location && (
                              <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                                <MapPin className="w-3 h-3" />
                                <span>{job.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {role !== 'admin' && (
                          <div className="mt-auto">
                            <ApplicationDialog
                              jobPostingId={job.id}
                              jobTitle={job.title}
                              company={job.company}
                              hasApplied={isApplied}
                              onApplicationSuccess={() => {
                                setAppliedJobs(prev => new Set([...prev, job.id]));
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default InternshipCards;