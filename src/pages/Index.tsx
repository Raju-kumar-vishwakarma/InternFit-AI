import { useState } from "react";

import HeroSection from "@/components/HeroSection";
import ResumeUpload from "@/components/ResumeUpload";
import WorkingProcess from "@/components/WorkingProcess";
import TrustedCompanies from "@/components/TrustedCompanies";
import StatsSection from "@/components/StatsSection";
import InternshipCards from "@/components/InternshipCards";
import JobSearch from "@/components/JobSearch";
import Footer from "@/components/Footer";
import { useUserRole } from "@/hooks/useUserRole";

const Index = () => {
  const { role } = useUserRole();
  const [jobQuery, setJobQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState<{ jobQuery: string; locationQuery: string } | undefined>();

  const handleSearch = () => {
    if (jobQuery || locationQuery) {
      setSearchQuery({ jobQuery, locationQuery });
      // Scroll to results section
      const resultsSection = document.getElementById('search-results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  

  return (
    <div className="min-h-screen">

      <HeroSection
        jobQuery={jobQuery}
        locationQuery={locationQuery}
        onJobQueryChange={setJobQuery}
        onLocationQueryChange={setLocationQuery}
        onSearch={handleSearch}
      />
      <ResumeUpload />
      <WorkingProcess />
      <TrustedCompanies />
      <StatsSection />
      <div id="search-results">
        <InternshipCards searchQuery={searchQuery} />
      </div>
      {role !== 'admin' && role !== 'recruiter' && <Footer />}
    </div>
  );
};

export default Index;
