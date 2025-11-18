import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil } from "lucide-react";
import { z } from "zod";

const jobPostingSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  company: z.string().trim().min(1, "Company is required").max(200, "Company must be less than 200 characters"),
  company_image: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().trim().max(5000, "Description must be less than 5000 characters").optional(),
  requirements: z.string().trim().max(5000, "Requirements must be less than 5000 characters").optional(),
  location: z.string().trim().max(200, "Location must be less than 200 characters").optional(),
  job_type: z.string().trim().max(100, "Job type must be less than 100 characters").optional(),
  salary_range: z.string().trim().max(100, "Salary range must be less than 100 characters").optional(),
  deadline: z.string().optional()
});

interface JobPostingDialogProps {
  existingPosting?: any;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const JobPostingDialog = ({ existingPosting, trigger, onSuccess }: JobPostingDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!existingPosting;
  
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    company_image: "",
    description: "",
    requirements: "",
    location: "",
    job_type: "",
    salary_range: "",
    deadline: "",
  });

  useEffect(() => {
    if (existingPosting) {
      setFormData({
        title: existingPosting.title || "",
        company: existingPosting.company || "",
        company_image: existingPosting.company_image || "",
        description: existingPosting.description || "",
        requirements: existingPosting.requirements || "",
        location: existingPosting.location || "",
        job_type: existingPosting.job_type || "",
        salary_range: existingPosting.salary_range || "",
        deadline: existingPosting.deadline || "",
      });
    }
  }, [existingPosting]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const validation = jobPostingSchema.safeParse(formData);
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
          description: "Please login to post a job",
          variant: "destructive",
        });
        return;
      }

      if (isEditMode) {
        const { error } = await supabase
          .from("job_postings")
          .update(formData)
          .eq("id", existingPosting.id);

        if (error) throw error;

        toast({
          title: "Job updated successfully!",
          description: `${formData.title} has been updated`,
        });
      } else {
        const { error } = await supabase.from("job_postings").insert({
          recruiter_id: user.id,
          ...formData,
          status: "active",
        });

        if (error) throw error;

        toast({
          title: "Job posted successfully!",
          description: `${formData.title} has been published`,
        });
      }

      setIsOpen(false);
      if (!isEditMode) {
        setFormData({
          title: "",
          company: "",
          company_image: "",
          description: "",
          requirements: "",
          location: "",
          job_type: "",
          salary_range: "",
          deadline: "",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => window.location.reload(), 500);
      }
    } catch (error: any) {
      toast({
        title: "Failed to post job",
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
        {trigger || (
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Post New Job
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Job Posting" : "Post New Internship"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the job posting details" : "Fill in the details to create a new internship posting"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Frontend Developer Intern"
            />
          </div>

          <div>
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="TechCorp Inc."
            />
          </div>

          <div>
            <Label htmlFor="company_image">Company Image URL</Label>
            <Input
              id="company_image"
              value={formData.company_image}
              onChange={(e) => setFormData({ ...formData, company_image: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the role and responsibilities..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="List the required skills and qualifications..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="New York, USA"
              />
            </div>

            <div>
              <Label htmlFor="job_type">Type</Label>
              <Input
                id="job_type"
                value={formData.job_type}
                onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                placeholder="Remote / Hybrid / On-site"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                value={formData.salary_range}
                onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                placeholder="$2000 - $3000/month"
              />
            </div>

            <div>
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !formData.title || !formData.company}
            className="w-full"
          >
            {isSubmitting ? "Posting..." : "Post Job"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobPostingDialog;
