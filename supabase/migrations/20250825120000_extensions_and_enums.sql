-- FloodTrace: extensions and enum types

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE public.user_role AS ENUM ('citizen', 'authority', 'admin');

CREATE TYPE public.authority_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE public.incident_type AS ENUM ('flood', 'blocked_drain');

CREATE TYPE public.incident_status AS ENUM (
  'submitted',
  'pending_review',
  'verified',
  'assigned',
  'resolved',
  'rejected'
);

CREATE TYPE public.incident_severity AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE public.media_source AS ENUM ('citizen_evidence', 'authority_resolution');

CREATE TYPE public.media_type AS ENUM ('image', 'video');

-- Updated-at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
