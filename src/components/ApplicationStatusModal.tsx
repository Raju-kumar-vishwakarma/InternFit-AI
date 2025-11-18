import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface ApplicationStatusModalProps {
  applicationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: string;
}

interface Query {
  id: string;
  sender_type: string;
  message: string;
  created_at: string;
  sender_id: string;
}

export function ApplicationStatusModal({
  applicationId,
  open,
  onOpenChange,
  status,
}: ApplicationStatusModalProps) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (applicationId && open) {
      fetchQueries();
    }
  }, [applicationId, open]);

  const fetchQueries = async () => {
    if (!applicationId) return;

    const { data, error } = await supabase
      .from("application_queries")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching queries:", error);
      return;
    }

    setQueries(data || []);
  };

  const handleSendQuery = async () => {
    if (!applicationId || !newMessage.trim()) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("application_queries").insert({
        application_id: applicationId,
        sender_id: user.id,
        sender_type: "candidate",
        message: newMessage.trim(),
      });

      if (error) throw error;

      toast({
        title: "Query sent",
        description: "Your query has been sent to the recruiter.",
      });

      setNewMessage("");
      fetchQueries();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "pending":
        return "Your application is under review by the recruiter.";
      case "reviewed":
        return "Your application has been reviewed and is being considered.";
      case "interview":
        return "Congratulations! You've been shortlisted for an interview.";
      case "hired":
      case "accepted":
        return "Congratulations! You've been selected for this position.";
      case "rejected":
        return "Unfortunately, your application was not successful this time.";
      default:
        return "Your application is being processed.";
    }
  };

  const getProgressStage = () => {
    const stages = [
      { name: "Applied", completed: true },
      {
        name: "Under Review",
        completed: ["reviewed", "interview", "hired", "accepted", "rejected"].includes(status),
      },
      {
        name: "Final Decision",
        completed: ["hired", "accepted", "rejected"].includes(status),
      },
    ];
    return stages;
  };

  const stages = getProgressStage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Current Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Message */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{getStatusMessage()}</p>
          </div>

          {/* Progress Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Application Progress</h3>
            <div className="space-y-3">
              {stages.map((stage, index) => (
                <div key={stage.name} className="flex items-center gap-3">
                  {stage.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        stage.completed ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {stage.name}
                    </p>
                  </div>
                  {!stage.completed && (
                    <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Query Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Have any questions?</h3>

            {/* Conversation History */}
            {queries.length > 0 && (
              <ScrollArea className="h-[200px] rounded-lg border p-4">
                <div className="space-y-3">
                  {queries.map((query) => (
                    <div
                      key={query.id}
                      className={`rounded-lg p-3 ${
                        query.sender_type === "candidate"
                          ? "bg-primary/10 ml-4"
                          : "bg-muted mr-4"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">
                          {query.sender_type === "candidate" ? "You" : "Recruiter"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(query.created_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <p className="text-sm mt-1">{query.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* New Message Input */}
            <div className="space-y-2">
              <Textarea
                placeholder="Type your query here..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleSendQuery}
                disabled={loading || !newMessage.trim()}
                className="w-full"
              >
                Send Query
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
