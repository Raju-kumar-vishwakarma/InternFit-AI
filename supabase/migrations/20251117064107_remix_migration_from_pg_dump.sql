--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: internship_recommendations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.internship_recommendations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    resume_id uuid NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    company text NOT NULL,
    match_score integer NOT NULL,
    skills_matched text[],
    location text,
    internship_type text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: resumes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resumes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    extracted_text text,
    skills text[],
    experience text,
    education text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: internship_recommendations internship_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internship_recommendations
    ADD CONSTRAINT internship_recommendations_pkey PRIMARY KEY (id);


--
-- Name: resumes resumes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT resumes_pkey PRIMARY KEY (id);


--
-- Name: resumes update_resumes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: internship_recommendations internship_recommendations_resume_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internship_recommendations
    ADD CONSTRAINT internship_recommendations_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.resumes(id) ON DELETE CASCADE;


--
-- Name: internship_recommendations Users can create their own recommendations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own recommendations" ON public.internship_recommendations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: resumes Users can create their own resumes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own resumes" ON public.resumes FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: internship_recommendations Users can delete their own recommendations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own recommendations" ON public.internship_recommendations FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: resumes Users can delete their own resumes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own resumes" ON public.resumes FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: resumes Users can update their own resumes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own resumes" ON public.resumes FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: internship_recommendations Users can view their own recommendations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own recommendations" ON public.internship_recommendations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: resumes Users can view their own resumes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own resumes" ON public.resumes FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: internship_recommendations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.internship_recommendations ENABLE ROW LEVEL SECURITY;

--
-- Name: resumes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


