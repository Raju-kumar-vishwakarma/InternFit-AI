-- Add company_image column to job_postings table
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS company_image text;