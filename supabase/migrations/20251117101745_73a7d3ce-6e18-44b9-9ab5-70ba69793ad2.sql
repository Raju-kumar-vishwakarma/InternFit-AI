-- Add recruiter notes field to applications table
ALTER TABLE public.applications
ADD COLUMN recruiter_notes TEXT;

-- Add status history tracking
CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;

-- Users can view status history for their applications
CREATE POLICY "Users can view their application status history"
ON public.application_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.applications
    WHERE applications.id = application_status_history.application_id
    AND applications.user_id = auth.uid()
  )
);

-- Recruiters can view status history for their job postings
CREATE POLICY "Recruiters can view status history for their jobs"
ON public.application_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.applications
    JOIN public.job_postings ON job_postings.id = applications.job_posting_id
    WHERE applications.id = application_status_history.application_id
    AND job_postings.recruiter_id = auth.uid()
  )
);

-- Recruiters can insert status history
CREATE POLICY "Recruiters can create status history"
ON public.application_status_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.applications
    JOIN public.job_postings ON job_postings.id = applications.job_posting_id
    WHERE applications.id = application_status_history.application_id
    AND job_postings.recruiter_id = auth.uid()
  )
);

-- Update RLS policy for applications to allow recruiters to update notes
CREATE POLICY "Recruiters can update applications for their jobs"
ON public.applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.job_postings
    WHERE job_postings.id = applications.job_posting_id
    AND job_postings.recruiter_id = auth.uid()
  )
);