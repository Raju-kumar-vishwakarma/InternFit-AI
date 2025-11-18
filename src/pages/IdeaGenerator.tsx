import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Star, Download, Loader2, FileText, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Idea {
  id?: string;
  title: string;
  category: string;
  description: string;
  why_useful: string;
  how_solves: string;
  is_favorite?: boolean;
}

const IdeaGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<Idea[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { toast } = useToast();

  const categories = [
    "All",
    "AI Features",
    "Platform Features",
    "Government Ideas",
    "User Experience",
    "Data & Insights",
    "Innovation",
    "Future Expansion"
  ];

  useEffect(() => {
    fetchSavedIdeas();
  }, []);

  const fetchSavedIdeas = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('generated_ideas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved ideas:', error);
      return;
    }

    setSavedIdeas(data || []);
  };

  const parseIdeas = (text: string): Idea[] => {
    const ideaBlocks = text.split('---IDEA START---').filter(block => block.includes('---IDEA END---'));
    
    return ideaBlocks.map(block => {
      const content = block.split('---IDEA END---')[0];
      const lines = content.split('\n').filter(line => line.trim());
      
      const idea: Idea = {
        title: '',
        category: '',
        description: '',
        why_useful: '',
        how_solves: ''
      };

      lines.forEach(line => {
        if (line.startsWith('TITLE:')) {
          idea.title = line.replace('TITLE:', '').trim();
        } else if (line.startsWith('CATEGORY:')) {
          idea.category = line.replace('CATEGORY:', '').trim();
        } else if (line.startsWith('DESCRIPTION:')) {
          idea.description = line.replace('DESCRIPTION:', '').trim();
        } else if (line.startsWith('WHY_USEFUL:')) {
          idea.why_useful = line.replace('WHY_USEFUL:', '').trim();
        } else if (line.startsWith('HOW_SOLVES:')) {
          idea.how_solves = line.replace('HOW_SOLVES:', '').trim();
        }
      });

      return idea;
    }).filter(idea => idea.title && idea.category);
  };

  const generateIdeas = async () => {
    setIsGenerating(true);
    setStreamedText("");
    setIdeas([]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ideas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to start idea generation");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              setStreamedText(prev => {
                const newText = prev + content;
                const parsedIdeas = parseIdeas(newText);
                if (parsedIdeas.length > 0) {
                  setIdeas(parsedIdeas);
                }
                return newText;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      toast({
        title: "Ideas Generated!",
        description: `Successfully generated ${ideas.length} innovative ideas`,
      });
    } catch (error) {
      console.error("Error generating ideas:", error);
      toast({
        title: "Error",
        description: "Failed to generate ideas. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveIdea = async (idea: Idea) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save ideas",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from('generated_ideas').insert({
      user_id: user.id,
      category: idea.category,
      title: idea.title,
      description: idea.description,
      why_useful: idea.why_useful,
      how_solves: idea.how_solves,
      is_favorite: true,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save idea",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Saved!",
      description: "Idea saved to your favorites",
    });
    fetchSavedIdeas();
  };

  const exportAsText = () => {
    const text = ideas.map(idea => 
      `Title: ${idea.title}\nCategory: ${idea.category}\n\nDescription:\n${idea.description}\n\nWhy Useful:\n${idea.why_useful}\n\nHow It Solves:\n${idea.how_solves}\n\n${'='.repeat(80)}\n\n`
    ).join('');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'internfit-ideas.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredIdeas = activeCategory === "all" 
    ? ideas 
    : ideas.filter(idea => idea.category.toLowerCase() === activeCategory.toLowerCase());

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "AI Features": "bg-blue-500/10 text-blue-500",
      "Platform Features": "bg-green-500/10 text-green-500",
      "Government Ideas": "bg-orange-500/10 text-orange-500",
      "User Experience": "bg-purple-500/10 text-purple-500",
      "Data & Insights": "bg-pink-500/10 text-pink-500",
      "Innovation": "bg-yellow-500/10 text-yellow-500",
      "Future Expansion": "bg-cyan-500/10 text-cyan-500",
    };
    return colors[category] || "bg-gray-500/10 text-gray-500";
  };

  return (
    <div className="min-h-screen bg-background">
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold">AI Idea Generator</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Generate innovative ideas for InternFit platform using AI
            </p>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={generateIdeas}
              disabled={isGenerating}
              size="lg"
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Lightbulb className="w-5 h-5" />
                  Generate 25+ Ideas
                </>
              )}
            </Button>

            {ideas.length > 0 && (
              <Button onClick={exportAsText} variant="outline" size="lg" className="gap-2">
                <Download className="w-5 h-5" />
                Export as Text
              </Button>
            )}
          </div>

          <Tabs defaultValue="generated" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generated">Generated Ideas ({ideas.length})</TabsTrigger>
              <TabsTrigger value="saved">Saved Ideas ({savedIdeas.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="generated">
              {/* Category Filter */}
              {ideas.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={activeCategory === cat.toLowerCase() ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setActiveCategory(cat.toLowerCase())}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Ideas Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {filteredIdeas.map((idea, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className={getCategoryColor(idea.category)}>
                        {idea.category}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => saveIdea(idea)}
                        className="h-8 w-8 p-0"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    </div>

                    <h3 className="text-xl font-bold mb-3">{idea.title}</h3>

                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-semibold text-muted-foreground mb-1">Description:</p>
                        <p className="text-foreground">{idea.description}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-muted-foreground mb-1">Why Useful:</p>
                        <p className="text-foreground">{idea.why_useful}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-muted-foreground mb-1">How It Solves:</p>
                        <p className="text-foreground">{idea.how_solves}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {ideas.length === 0 && !isGenerating && (
                <div className="text-center py-20">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Click "Generate Ideas" to start
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved">
              <div className="grid gap-6 md:grid-cols-2">
                {savedIdeas.map((idea) => (
                  <Card key={idea.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className={getCategoryColor(idea.category)}>
                        {idea.category}
                      </Badge>
                      <Star className="w-5 h-5 fill-primary text-primary" />
                    </div>

                    <h3 className="text-xl font-bold mb-3">{idea.title}</h3>

                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-semibold text-muted-foreground mb-1">Description:</p>
                        <p className="text-foreground">{idea.description}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-muted-foreground mb-1">Why Useful:</p>
                        <p className="text-foreground">{idea.why_useful}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-muted-foreground mb-1">How It Solves:</p>
                        <p className="text-foreground">{idea.how_solves}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {savedIdeas.length === 0 && (
                <div className="text-center py-20">
                  <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    No saved ideas yet
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default IdeaGenerator;