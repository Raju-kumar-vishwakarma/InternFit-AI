import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";

interface HeroSectionProps {
  jobQuery: string;
  locationQuery: string;
  onJobQueryChange: (value: string) => void;
  onLocationQueryChange: (value: string) => void;
  onSearch: () => void;
}

const HeroSection = ({
  jobQuery,
  locationQuery,
  onJobQueryChange,
  onLocationQueryChange,
  onSearch,
}: HeroSectionProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <section className="relative w-full py-20 overflow-hidden ">

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* AI Tag */}
          <div className="inline-block">
            <span className="bg-blue-light text-primary px-4 py-2 rounded-full text-sm font-semibold">
              AI-Based Job Engine
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            Aspiring Students to <br />
            Forward-Looking Recruiters —
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-text max-w-2xl mx-auto">
            AI Engine to connect students with internships and recruiters with
            talent.
          </p>

          {/* Search Bar */}
          <div className="bg-card rounded-full shadow-lg p-2 flex flex-col md:flex-row gap-2 max-w-3xl mx-auto mt-8">
            {/* Job Input */}
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-6 py-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                value={jobQuery}
                onChange={(e) => onJobQueryChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Job title, keywords, or company"
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Location Input */}
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-6 py-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <Input
                value={locationQuery}
                onChange={(e) => onLocationQueryChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="City, state, or remote"
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Button */}
            <Button
              onClick={onSearch}
              className="rounded-full px-8 py-8 font-semibold text-base"
            >
              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
