-- Allow admins to view all job postings and delete any posting
CREATE POLICY "Admins can view all job postings"
ON public.job_postings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any job posting"
ON public.job_postings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));