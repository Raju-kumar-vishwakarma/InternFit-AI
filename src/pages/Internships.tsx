import { useState } from "react";

import Footer from "@/components/Footer";
import InternshipCards from "@/components/InternshipCards";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, X } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const Internships = () => {
  const { role } = useUserRole();
  const [jobQuery, setJobQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  
  // Default state empty strings rakhein
  const [searchTrigger, setSearchTrigger] = useState({ jobQuery: "", locationQuery: "" });

  const handleSearch = () => {
    setSearchTrigger({ jobQuery, locationQuery });
  };

  const handleClear = () => {
    setJobQuery("");
    setLocationQuery("");
    setSearchTrigger({ jobQuery: "", locationQuery: "" });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const isSearchActive = jobQuery || locationQuery || searchTrigger.jobQuery || searchTrigger.locationQuery;
  
  return (
    <div className="min-h-screen bg-background">
      
      {/* Search Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
              Find Your Perfect Internship
            </h1>
            
            <div className="bg-card rounded-lg shadow-lg p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 bg-muted rounded-md px-4 py-3">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input 
                  value={jobQuery}
                  onChange={(e) => setJobQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Job title, keywords, or company" 
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="flex-1 flex items-center gap-2 bg-muted rounded-md px-4 py-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <Input 
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="City, state, or remote" 
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleSearch}
                  className="rounded-md px-8 py-6 font-semibold text-base flex-1 md:flex-none"
                >
                  Search
                </Button>

                {/* Search Bar wala Cancel Button */}
                {isSearchActive && (
                  <Button 
                    onClick={handleClear}
                    variant="outline"
                    className="rounded-md px-4 py-6 font-semibold text-base text-muted-foreground hover:text-foreground hover:bg-muted"
                    title="Clear Search"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Internship Listings - Yahan humne onClearSearch pass kiya hai */}
      <InternshipCards 
        searchQuery={searchTrigger} 
        onClearSearch={handleClear} 
      />

      {role !== 'admin' && role !== 'recruiter' && <Footer />}
    </div>
  );
};

export default Internships;