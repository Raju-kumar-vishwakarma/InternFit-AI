-- Allow service role to insert user roles (needed for admin adding recruiters)
CREATE POLICY "Service role can insert user roles"
ON public.user_roles FOR INSERT
WITH CHECK (true);