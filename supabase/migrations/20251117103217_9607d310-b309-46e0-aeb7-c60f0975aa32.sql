-- Add RLS policies to allow recruiters to view profiles and resumes of applicants to their jobs

-- Allow recruiters to view profiles of users who applied to their job postings
CREATE POLICY "Recruiters can view applicant profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.applications
    JOIN public.job_postings ON applications.job_posting_id = job_postings.id
    WHERE job_postings.recruiter_id = auth.uid()
      AND applications.user_id = profiles.user_id
  )
);

-- Allow recruiters to view resumes of users who applied to their job postings
CREATE POLICY "Recruiters can view applicant resumes"
ON public.resumes
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.applications
    JOIN public.job_postings ON applications.job_posting_id = job_postings.id
    WHERE job_postings.recruiter_id = auth.uid()
      AND applications.user_id = resumes.user_id
  )
);