import { UserPlus, Upload, Sparkles, Send, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up for free"
  },
  {
    icon: Upload,
    title: "Upload Resume",
    description: "Add your CV/Resume"
  },
  {
    icon: Sparkles,
    title: "AI Recommendation",
    description: "Get matched internships"
  },
  {
    icon: Send,
    title: "Apply Internship",
    description: "One-click apply"
  },
  {
    icon: CheckCircle,
    title: "Status",
    description: "Track applications"
  }
];

const WorkingProcess = () => {
  return (
    <section className="relative w-full py-20 overflow-hidden">
      {/* Blue semi-circle decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-primary/10 rounded-b-full -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-text text-lg">Simple 5-step process to land your dream internship</p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex flex-col items-center max-w-[140px]">
                <div className="relative">
                  {/* Circle */}
                  <div className="w-28 h-28 bg-card rounded-full shadow-lg flex items-center justify-center border-4 border-primary/20">
                    <Icon className="w-12 h-12 text-primary" />
                  </div>
                  {/* Step number */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="mt-4 font-semibold text-center">{step.title}</h3>
                <p className="text-sm text-gray-text text-center">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WorkingProcess;
