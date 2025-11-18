
import Footer from "@/components/Footer";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";

const articles = [
  {
    category: "Career Tips",
    title: "How to Write a Winning Resume for Your First Internship",
    excerpt: "Learn the essential elements that make your resume stand out to recruiters and land your dream internship.",
    date: "Nov 15, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop"
  },
  {
    category: "Industry Trends",
    title: "Top 10 Skills Employers Look for in 2025",
    excerpt: "Discover the most in-demand skills that will help you succeed in today's competitive job market.",
    date: "Nov 12, 2025",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop"
  },
  {
    category: "Success Stories",
    title: "From Intern to Full-Time: Sarah's Journey at TCS",
    excerpt: "Read how Sarah leveraged her internship experience to secure a full-time position at one of India's top IT companies.",
    date: "Nov 10, 2025",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop"
  },
  {
    category: "Interview Prep",
    title: "Ace Your Virtual Interview: Expert Tips and Tricks",
    excerpt: "Master the art of virtual interviews with these proven strategies from hiring managers.",
    date: "Nov 8, 2025",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&auto=format&fit=crop"
  },
  {
    category: "Career Growth",
    title: "Building Your Professional Network as a Student",
    excerpt: "Networking strategies that will help you connect with industry professionals and mentors.",
    date: "Nov 5, 2025",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&auto=format&fit=crop"
  },
  {
    category: "Tech Skills",
    title: "Learning to Code: Best Resources for Beginners",
    excerpt: "A curated list of free and paid resources to kickstart your coding journey.",
    date: "Nov 3, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop"
  }
];

const Insights = () => {
  const { role } = useUserRole();
  
  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1600px] h-[800px] bg-primary/10 rounded-b-full -z-10" />
        
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Career Insights & Resources
            </h1>
            <p className="text-xl text-gray-text">
              Expert advice, industry trends, and success stories to guide your career journey
            </p>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-card rounded-2xl overflow-hidden shadow-xl grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto">
                <img 
                  src={articles[0].image} 
                  alt={articles[0].title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="inline-block bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold mb-4 w-fit">
                  Featured
                </span>
                <h2 className="text-3xl font-bold mb-4">{articles[0].title}</h2>
                <p className="text-gray-text mb-6">{articles[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-text mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{articles[0].date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{articles[0].readTime}</span>
                  </div>
                </div>
                <Button className="w-fit">
                  Read Article
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Latest Articles</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {articles.slice(1).map((article, index) => (
              <div 
                key={index} 
                className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-card text-primary px-3 py-1 rounded-full text-xs font-semibold">
                      {article.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-text text-sm mb-4">{article.excerpt}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-text">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{article.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {role !== 'admin' && role !== 'recruiter' && <Footer />}
    </div>
  );
};

export default Insights;