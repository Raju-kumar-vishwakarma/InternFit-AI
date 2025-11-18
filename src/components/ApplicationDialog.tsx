import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const applicationSchema = z.object({
  coverLetter: z.string().trim().min(1, "Cover letter cannot be empty").max(5000, "Cover letter must be less than 5000 characters")
});

interface ApplicationDialogProps {
  recommendationId?: string;
  jobPostingId?: string;
  jobTitle: string;
  company: string;
  hasApplied?: boolean;
  onApplicationSuccess?: () => void;
}

const ApplicationDialog = ({ recommendationId, jobPostingId, jobTitle, company, hasApplied = false, onApplicationSuccess }: ApplicationDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const validation = applicationSchema.safeParse({ coverLetter });
      if (!validation.success) {
        toast({
          title: "Validation error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to apply",
          variant: "destructive",
        });
        return;
      }

      const insertData: any = {
        user_id: user.id,
        cover_letter: coverLetter,
        status: "pending",
      };

      if (recommendationId) {
        insertData.recommendation_id = recommendationId;
      } else if (jobPostingId) {
        insertData.job_posting_id = jobPostingId;
      }

      const { error } = await supabase.from("applications").insert(insertData);

      if (error) throw error;

      toast({
        title: "Application submitted!",
        description: `Your application for ${jobTitle} at ${company} has been submitted successfully`,
      });

      setIsOpen(false);
      setCoverLetter("");
      
      if (onApplicationSuccess) {
        onApplicationSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {hasApplied ? (
          <Button 
            className="w-full bg-green-600 hover:bg-green-700 text-white cursor-not-allowed" 
            disabled
          >
            Applied ✓
          </Button>
        ) : (
          <Button className="w-full">Apply Now</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            {company} - Submit your application with a cover letter
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="cover_letter">Cover Letter</Label>
            <Textarea
              id="cover_letter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell us why you're a great fit for this role..."
              rows={8}
              className="mt-2"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !coverLetter.trim()}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDialog;
