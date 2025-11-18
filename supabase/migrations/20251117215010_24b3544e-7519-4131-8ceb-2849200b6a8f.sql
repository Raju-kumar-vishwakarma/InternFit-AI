-- Create favorites table for candidates to save job postings
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES public.internship_recommendations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT favorites_one_reference CHECK (
    (job_posting_id IS NOT NULL AND recommendation_id IS NULL) OR
    (job_posting_id IS NULL AND recommendation_id IS NOT NULL)
  ),
  UNIQUE(user_id, job_posting_id),
  UNIQUE(user_id, recommendation_id)
);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users can create their own favorites
CREATE POLICY "Users can create their own favorites"
ON public.favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
ON public.favorites
FOR SELECT
USING (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
ON public.favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_job_posting_id ON public.favorites(job_posting_id);
CREATE INDEX idx_favorites_recommendation_id ON public.favorites(recommendation_id);