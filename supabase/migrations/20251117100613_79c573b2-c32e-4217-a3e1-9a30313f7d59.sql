-- Add skills column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';

-- Add additional profile fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_title text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_years integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_company text;