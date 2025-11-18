-- Add comprehensive fields to profiles table for storing detailed resume data
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS projects jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS detailed_experience jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS detailed_education jsonb DEFAULT '[]'::jsonb;