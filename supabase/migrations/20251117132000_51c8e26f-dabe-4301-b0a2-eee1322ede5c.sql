-- Create table for saved ideas
CREATE TABLE public.generated_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  why_useful TEXT,
  how_solves TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_ideas ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own ideas"
ON public.generated_ideas
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ideas"
ON public.generated_ideas
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas"
ON public.generated_ideas
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas"
ON public.generated_ideas
FOR DELETE
USING (auth.uid() = user_id);