-- Create application_queries table for candidate-recruiter communication
CREATE TABLE public.application_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('candidate', 'recruiter')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.application_queries ENABLE ROW LEVEL SECURITY;

-- Candidates can view queries for their applications
CREATE POLICY "Candidates can view their application queries"
ON public.application_queries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.applications
    WHERE applications.id = application_queries.application_id
    AND applications.user_id = auth.uid()
  )
);

-- Candidates can create queries for their applications
CREATE POLICY "Candidates can create queries for their applications"
ON public.application_queries
FOR INSERT
WITH CHECK (
  sender_type = 'candidate'
  AND EXISTS (
    SELECT 1 FROM public.applications
    WHERE applications.id = application_queries.application_id
    AND applications.user_id = auth.uid()
  )
);

-- Recruiters can view queries for their job postings
CREATE POLICY "Recruiters can view queries for their jobs"
ON public.application_queries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.applications
    JOIN public.job_postings ON applications.job_posting_id = job_postings.id
    WHERE applications.id = application_queries.application_id
    AND job_postings.recruiter_id = auth.uid()
  )
);

-- Recruiters can create responses for their job applications
CREATE POLICY "Recruiters can respond to queries"
ON public.application_queries
FOR INSERT
WITH CHECK (
  sender_type = 'recruiter'
  AND EXISTS (
    SELECT 1 FROM public.applications
    JOIN public.job_postings ON applications.job_posting_id = job_postings.id
    WHERE applications.id = application_queries.application_id
    AND job_postings.recruiter_id = auth.uid()
  )
);

-- Create index for better query performance
CREATE INDEX idx_application_queries_application_id ON public.application_queries(application_id);
CREATE INDEX idx_application_queries_created_at ON public.application_queries(created_at DESC);