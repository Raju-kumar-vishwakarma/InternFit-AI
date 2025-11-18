import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface SkillsManagerProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export const SkillsManager = ({ skills, onSkillsChange }: SkillsManagerProps) => {
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onSkillsChange([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a skill (e.g., React, Python, etc.)"
          className="flex-1"
        />
        <Button onClick={addSkill} type="button" variant="outline" size="icon">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {skills.length === 0 ? (
          <p className="text-muted-foreground text-sm">No skills added yet</p>
        ) : (
          skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="px-3 py-1 gap-2">
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="hover:text-destructive"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
};
