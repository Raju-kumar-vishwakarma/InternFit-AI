-- Add job_posting_id to applications table and make recommendation_id nullable
ALTER TABLE applications 
ADD COLUMN job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE;

-- Make recommendation_id nullable since applications can be for either recommendations or job postings
ALTER TABLE applications 
ALTER COLUMN recommendation_id DROP NOT NULL;

-- Add check constraint to ensure either recommendation_id or job_posting_id is set
ALTER TABLE applications
ADD CONSTRAINT applications_reference_check 
CHECK (
  (recommendation_id IS NOT NULL AND job_posting_id IS NULL) OR
  (recommendation_id IS NULL AND job_posting_id IS NOT NULL)
);

-- Add RLS policy for recruiters to view applications for their job postings
CREATE POLICY "Recruiters can view applications for their jobs"
ON applications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM job_postings
    WHERE job_postings.id = applications.job_posting_id
    AND job_postings.recruiter_id = auth.uid()
  )
);