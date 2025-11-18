-- Add additional profile fields for comprehensive user information
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS marital_status text,
ADD COLUMN IF NOT EXISTS availability text,
ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS country text;