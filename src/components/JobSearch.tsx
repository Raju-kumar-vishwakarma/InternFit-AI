import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";

interface JobSearchProps {
  jobQuery: string;
  locationQuery: string;
  onJobQueryChange: (value: string) => void;
  onLocationQueryChange: (value: string) => void;
  onSearch: () => void;
}

const JobSearch = ({ jobQuery, locationQuery, onJobQueryChange, onLocationQueryChange, onSearch }: JobSearchProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <section className="w-full py-16 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Search Your Dream Job
          </h2>
          
          {/* Search Bar */}
          <div className="bg-card rounded-xl shadow-xl p-3 flex flex-col md:flex-row gap-3 border border-border">
            <div className="flex-1 flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-3">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <Input 
                value={jobQuery}
                onChange={(e) => onJobQueryChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Job title, keywords, or company" 
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="flex-1 flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-3">
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <Input 
                value={locationQuery}
                onChange={(e) => onLocationQueryChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="City, state, or remote" 
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button 
              onClick={onSearch}
              className="rounded-lg px-8 py-6 font-semibold text-base hover:scale-105 transition-transform"
            >
              Search Jobs
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't worry about spelling - we'll suggest similar matches!
          </p>
        </div>
      </div>
    </section>
  );
};

export default JobSearch;
