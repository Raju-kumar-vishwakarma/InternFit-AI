import { CheckCircle2, AlertCircle, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ResumeQualityScoreProps {
  data: {
    skills?: string[];
    experience?: any[];
    education?: any[];
    projects?: any[];
    certifications?: any[];
  };
}

const ResumeQualityScore = ({ data }: ResumeQualityScoreProps) => {
  const calculateScore = () => {
    let score = 0;
    let maxScore = 100;
    const breakdown: { label: string; points: number; maxPoints: number; status: "complete" | "partial" | "missing" }[] = [];

    // Skills (25 points max)
    const skillsCount = data.skills?.length || 0;
    const skillsPoints = Math.min(25, skillsCount * 2.5); // 10+ skills = full points
    breakdown.push({
      label: "Skills",
      points: skillsPoints,
      maxPoints: 25,
      status: skillsPoints >= 25 ? "complete" : skillsPoints > 0 ? "partial" : "missing"
    });
    score += skillsPoints;

    // Experience (25 points max)
    const experienceCount = data.experience?.length || 0;
    const hasDetailedExperience = data.experience?.some((exp: any) => exp.achievements || exp.responsibilities);
    let experiencePoints = Math.min(15, experienceCount * 5); // Base points for count
    if (hasDetailedExperience) experiencePoints += 10; // Bonus for details
    breakdown.push({
      label: "Experience",
      points: experiencePoints,
      maxPoints: 25,
      status: experiencePoints >= 25 ? "complete" : experiencePoints > 0 ? "partial" : "missing"
    });
    score += experiencePoints;

    // Education (20 points max)
    const educationCount = data.education?.length || 0;
    const hasDetailedEducation = data.education?.some((edu: any) => edu.gpa || edu.field_of_study);
    let educationPoints = Math.min(15, educationCount * 10); // Base points
    if (hasDetailedEducation) educationPoints += 5; // Bonus for details
    breakdown.push({
      label: "Education",
      points: educationPoints,
      maxPoints: 20,
      status: educationPoints >= 20 ? "complete" : educationPoints > 0 ? "partial" : "missing"
    });
    score += educationPoints;

    // Projects (15 points max)
    const projectsCount = data.projects?.length || 0;
    const projectsPoints = Math.min(15, projectsCount * 5);
    breakdown.push({
      label: "Projects",
      points: projectsPoints,
      maxPoints: 15,
      status: projectsPoints >= 15 ? "complete" : projectsPoints > 0 ? "partial" : "missing"
    });
    score += projectsPoints;

    // Certifications (15 points max)
    const certificationsCount = data.certifications?.length || 0;
    const certificationsPoints = Math.min(15, certificationsCount * 5);
    breakdown.push({
      label: "Certifications",
      points: certificationsPoints,
      maxPoints: 15,
      status: certificationsPoints >= 15 ? "complete" : certificationsPoints > 0 ? "partial" : "missing"
    });
    score += certificationsPoints;

    return { score: Math.round(score), maxScore, breakdown };
  };

  const { score, maxScore, breakdown } = calculateScore();
  const percentage = (score / maxScore) * 100;

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = () => {
    if (percentage >= 80) return "Excellent";
    if (percentage >= 60) return "Good";
    if (percentage >= 40) return "Fair";
    return "Needs Improvement";
  };

  const getStatusIcon = (status: "complete" | "partial" | "missing") => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "partial":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "missing":
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Resume Quality Score</h3>
        <div className="flex items-center gap-2">
          <span className={`text-3xl font-bold ${getScoreColor()}`}>{score}</span>
          <span className="text-muted-foreground">/ {maxScore}</span>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{getScoreLabel()}</span>
          <span className="text-muted-foreground">{Math.round(percentage)}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground mb-2">Breakdown:</p>
        {breakdown.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getStatusIcon(item.status)}
              <span>{item.label}</span>
            </div>
            <span className="text-muted-foreground">
              {Math.round(item.points)} / {item.maxPoints}
            </span>
          </div>
        ))}
      </div>

      {percentage < 80 && (
        <div className="mt-3 p-2 bg-background/50 rounded text-xs text-muted-foreground">
          <p className="font-medium mb-1">💡 Tips to improve:</p>
          {breakdown.map((item, idx) => 
            item.status !== "complete" ? (
              <p key={idx}>• Add more {item.label.toLowerCase()} details</p>
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeQualityScore;
