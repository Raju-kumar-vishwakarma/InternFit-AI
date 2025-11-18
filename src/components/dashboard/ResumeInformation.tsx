import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, GraduationCap, Award, FileText } from "lucide-react";

interface ResumeInformationProps {
  resume: {
    id: string;
    file_name: string;
    skills: string[] | null;
    experience: string | null;
    education: string | null;
    extracted_text: string | null;
  };
}

const ResumeInformation = ({ resume }: ResumeInformationProps) => {
  // Generate a summary from extracted text (first 200 characters)
  const generateSummary = (text: string | null) => {
    if (!text) return "No summary available";
    return text.length > 200 ? text.substring(0, 200) + "..." : text;
  };

  return (
    <div className="space-y-6">
      {/* Resume Summary Section */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Resume Summary</h3>
            <p className="text-sm text-muted-foreground">Quick overview of your profile</p>
          </div>
        </div>
        <p className="text-foreground leading-relaxed">
          {generateSummary(resume.extracted_text)}
        </p>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Skills Section */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Skills</h3>
              <p className="text-sm text-muted-foreground">Your technical expertise</p>
            </div>
          </div>
          {resume.skills && resume.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary"
                  className="bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No skills listed</p>
          )}
        </Card>

        {/* Education Section */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Education</h3>
              <p className="text-sm text-muted-foreground">Your academic background</p>
            </div>
          </div>
          {resume.education ? (
            <div className="space-y-2">
              {resume.education.split('\n').filter(line => line.trim()).map((line, idx) => (
                <p key={idx} className="text-foreground text-sm leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No education information</p>
          )}
        </Card>
      </div>

      {/* Experience Section - Full Width */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Experience</h3>
            <p className="text-sm text-muted-foreground">Your work history</p>
          </div>
        </div>
        {resume.experience ? (
          <div className="space-y-3">
            {resume.experience.split('\n').filter(line => line.trim()).map((line, idx) => (
              <p key={idx} className="text-foreground text-sm leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No experience information</p>
        )}
      </Card>
    </div>
  );
};

export default ResumeInformation;
