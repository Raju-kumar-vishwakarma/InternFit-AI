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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

interface AddRecruiterDialogProps {
  onRecruiterAdded?: () => void;
}

const AddRecruiterDialog = ({ onRecruiterAdded }: AddRecruiterDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    company: "",
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

      // Call edge function to create recruiter (preserves admin session)
      const { data, error } = await supabase.functions.invoke('create-recruiter', {
        body: { 
          full_name: formData.full_name,
          email: formData.email, 
          password: formData.password,
          company: formData.company
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Recruiter added successfully!",
        description: `${formData.email} has been added as a recruiter`,
      });

      setIsOpen(false);
      setFormData({ full_name: "", email: "", password: "", company: "" });
      
      // Refresh the recruiters list
      if (onRecruiterAdded) {
        onRecruiterAdded();
      }
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error occurred";
      
      toast({
        title: "Failed to add recruiter",
        description: errorMessage,
        variant: "destructive",
      });

      // Still refresh the list in case the recruiter already exists
      if (errorMessage.includes("already a recruiter") && onRecruiterAdded) {
        setTimeout(() => {
          onRecruiterAdded();
        }, 500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <UserPlus className="w-5 h-5" />
          Add Recruiter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Recruiter</DialogTitle>
          <DialogDescription>
            Create a new recruiter account with email and password
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="recruiter@company.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter a secure password"
            />
          </div>

          <div>
            <Label htmlFor="company">Company Name *</Label>
            <Input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Acme Corp"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !formData.full_name || !formData.email || !formData.password || !formData.company}
            className="w-full"
          >
            {isSubmitting ? "Adding..." : "Add Recruiter"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecruiterDialog;
