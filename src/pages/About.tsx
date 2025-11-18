import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Target, Eye, Users, Award } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To bridge the gap between aspiring students and forward-looking recruiters through AI-powered matching technology."
  },
  {
    icon: Eye,
    title: "Our Vision",
    description: "To create a world where every student finds the perfect internship opportunity that launches their career."
  },
  {
    icon: Users,
    title: "Our Community",
    description: "21,977+ candidates and 8,170+ companies trust InternFit to connect talent with opportunities."
  },
  {
    icon: Award,
    title: "Our Promise",
    description: "Transparent, fair, and AI-driven recommendations that put your skills and aspirations first."
  }
];

const team = [
  {
    name: "Rajesh Kumar",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop"
  },
  {
    name: "Priya Sharma",
    role: "Head of AI & Technology",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop"
  },
  {
    name: "Amit Patel",
    role: "Head of Partnerships",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop"
  },
  {
    name: "Sneha Reddy",
    role: "Head of Student Success",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&auto=format&fit=crop"
  }
];

const About = () => {
  const { role } = useUserRole();
  
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1600px] h-[800px] bg-primary/10 rounded-t-full -z-10" />
        
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              About InternFit
            </h1>
            <p className="text-xl text-gray-text leading-relaxed">
              We're revolutionizing how students discover internships and how companies find talent. 
              Our AI-powered platform creates perfect matches based on skills, aspirations, and opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl p-8 md:p-12 shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-text leading-relaxed">
                <p>
                  InternFit was born from a simple observation: talented students were struggling to find 
                  the right internship opportunities, while companies were missing out on great candidates 
                  buried in stacks of applications.
                </p>
                <p>
                  In 2023, we set out to solve this problem using artificial intelligence. We built a platform 
                  that understands both what students can offer and what companies need, creating matches 
                  that benefit everyone.
                </p>
                <p>
                  Today, we're proud to serve over 20,000 students and 8,000+ companies across India, 
                  including partnerships with government organizations and leading corporations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Drives Us</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index} 
                  className="bg-card rounded-xl p-8 shadow-lg"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                  <p className="text-gray-text leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-gray-text">The people behind InternFit's success</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-bold text-lg">{member.name}</h4>
                <p className="text-gray-text text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
            <div>
              <div className="text-5xl font-bold mb-2">20,170</div>
              <div className="text-lg opacity-90">Live Internships</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">8,170</div>
              <div className="text-lg opacity-90">Partner Companies</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">21,977</div>
              <div className="text-lg opacity-90">Active Candidates</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">92%</div>
              <div className="text-lg opacity-90">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {role !== 'admin' && role !== 'recruiter' && <Footer />}
    </div>
  );
};

export default About;