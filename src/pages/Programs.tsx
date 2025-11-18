import Footer from "@/components/Footer";
import { GraduationCap, Briefcase, TrendingUp, Award } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const programs = [
  {
    icon: GraduationCap,
    title: "Student Internship Program",
    description: "Hands-on experience for students in real-world projects. Build your skills and resume with industry-leading companies.",
    duration: "3-6 months",
    eligibility: "Current students",
    benefits: ["Mentorship", "Certificate", "Stipend", "Job opportunity"]
  },
  {
    icon: Briefcase,
    title: "PM Internship Scheme",
    description: "Government-backed program connecting youth with top organizations. Gain practical experience with financial support.",
    duration: "6-12 months",
    eligibility: "Recent graduates",
    benefits: ["Government support", "Stipend", "Training", "Placement assistance"]
  },
  {
    icon: TrendingUp,
    title: "Skill Development Program",
    description: "Industry-specific training programs designed to enhance your technical and soft skills for career advancement.",
    duration: "1-3 months",
    eligibility: "All levels",
    benefits: ["Certification", "Hands-on projects", "Industry mentors", "Career guidance"]
  },
  {
    icon: Award,
    title: "Corporate Training Program",
    description: "Intensive programs by leading companies to prepare future employees. Direct pathway to full-time positions.",
    duration: "3-6 months",
    eligibility: "Final year students",
    benefits: ["Pre-placement", "High stipend", "Full-time offer", "Industry exposure"]
  }
];

const Programs = () => {
  const { role } = useUserRole();
  
  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1600px] h-[800px] bg-primary/10 rounded-t-full -z-10" />
        
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Internship Programs
            </h1>
            <p className="text-xl text-gray-text">
              Choose from our diverse range of programs designed to kickstart your career
            </p>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {programs.map((program, index) => {
              const Icon = program.icon;
              return (
                <div 
                  key={index} 
                  className="bg-card rounded-xl p-8 shadow-lg border border-border hover:shadow-xl transition-shadow"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4">{program.title}</h3>
                  <p className="text-gray-text mb-6">{program.description}</p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-text">Duration:</span>
                      <span className="font-semibold">{program.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-text">Eligibility:</span>
                      <span className="font-semibold">{program.eligibility}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-semibold mb-2">Benefits:</p>
                    <div className="flex flex-wrap gap-2">
                      {program.benefits.map((benefit, idx) => (
                        <span 
                          key={idx}
                          className="bg-blue-light text-primary text-xs px-3 py-1 rounded-full font-medium"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {role !== 'admin' && role !== 'recruiter' && <Footer />}
    </div>
  );
};

export default Programs;