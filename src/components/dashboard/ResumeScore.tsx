import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ResumeScoreProps {
  resume: {
    skills: string[] | null;
    experience: string | null;
    education: string | null;
    extracted_text: string | null;
  };
}

const ResumeScore = ({ resume }: ResumeScoreProps) => {
  // Calculate score based on resume content
  const calculateScore = () => {
    let score = 0;
    const maxScore = 100;
    
    // Skills contribute 40 points
    if (resume.skills && resume.skills.length > 0) {
      const skillPoints = Math.min(40, resume.skills.length * 4);
      score += skillPoints;
    }
    
    // Experience contributes 30 points
    if (resume.experience && resume.experience.trim().length > 0) {
      const expLength = resume.experience.trim().length;
      const expPoints = Math.min(30, Math.floor(expLength / 50));
      score += expPoints;
    }
    
    // Education contributes 20 points
    if (resume.education && resume.education.trim().length > 0) {
      const eduLength = resume.education.trim().length;
      const eduPoints = Math.min(20, Math.floor(eduLength / 30));
      score += eduPoints;
    }
    
    // Resume completeness contributes 10 points
    if (resume.extracted_text && resume.extracted_text.length > 200) {
      score += 10;
    }
    
    return Math.min(score, maxScore);
  };

  const score = calculateScore();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (!resume.skills || resume.skills.length < 5) {
      recommendations.push("Add more skills to improve your score");
    }
    
    if (!resume.experience || resume.experience.length < 100) {
      recommendations.push("Add detailed work experience");
    }
    
    if (!resume.education || resume.education.length < 50) {
      recommendations.push("Include complete education details");
    }
    
    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Award className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Resume Score</h3>
            <p className="text-sm text-muted-foreground">Based on your skills and experience</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
            {score}
          </div>
          <Badge 
            className={`${getScoreBg(score)} text-white mt-2`}
            variant="secondary"
          >
            {getScoreLabel(score)}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Completeness</span>
            <span className="text-sm text-muted-foreground">{score}%</span>
          </div>
          <Progress value={score} className="h-3" />
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-2xl font-bold">
              {resume.skills?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Skills</div>
          </div>
          
          <div className="text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-2xl font-bold">
              {resume.experience ? "✓" : "✗"}
            </div>
            <div className="text-xs text-muted-foreground">Experience</div>
          </div>
          
          <div className="text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-2xl font-bold">
              {resume.education ? "✓" : "✗"}
            </div>
            <div className="text-xs text-muted-foreground">Education</div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-2">Recommendations to Improve:</h4>
                <ul className="space-y-1">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ResumeScore;
