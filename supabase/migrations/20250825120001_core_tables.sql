-- FloodTrace: core relational tables

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role public.user_role NOT NULL DEFAULT 'citizen',
  authority_status public.authority_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_authority_status_check CHECK (
    (role = 'authority' AND authority_status IS NOT NULL)
    OR (role = 'citizen' AND authority_status IS NULL)
    OR (role = 'admin' AND authority_status = 'approved')
  )
);

CREATE INDEX profiles_role_idx ON public.profiles (role);
CREATE INDEX profiles_authority_status_idx ON public.profiles (authority_status)
  WHERE authority_status IS NOT NULL;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- incidents
-- ---------------------------------------------------------------------------
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  incident_type public.incident_type NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location_name TEXT,
  severity public.incident_severity NOT NULL DEFAULT 'medium',
  captured_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status public.incident_status NOT NULL DEFAULT 'submitted',
  verification_notes TEXT,
  authority_feedback TEXT,
  assigned_to UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  parent_incident_id UUID REFERENCES public.incidents (id) ON DELETE SET NULL,
  is_primary BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT incidents_latitude_check CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT incidents_longitude_check CHECK (longitude >= -180 AND longitude <= 180),
  CONSTRAINT incidents_resolved_at_check CHECK (
    (status = 'resolved' AND resolved_at IS NOT NULL)
    OR (status <> 'resolved')
  )
);

CREATE INDEX incidents_reporter_id_idx ON public.incidents (reporter_id);
CREATE INDEX incidents_status_idx ON public.incidents (status);
CREATE INDEX incidents_severity_idx ON public.incidents (severity);
CREATE INDEX incidents_type_idx ON public.incidents (incident_type);
CREATE INDEX incidents_submitted_at_idx ON public.incidents (submitted_at DESC);
CREATE INDEX incidents_assigned_to_idx ON public.incidents (assigned_to)
  WHERE assigned_to IS NOT NULL;
CREATE INDEX incidents_parent_incident_id_idx ON public.incidents (parent_incident_id)
  WHERE parent_incident_id IS NOT NULL;
CREATE INDEX incidents_location_idx ON public.incidents (latitude, longitude);
CREATE INDEX incidents_primary_status_idx ON public.incidents (is_primary, status)
  WHERE is_primary = TRUE;

CREATE TRIGGER incidents_set_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- supporting_reports (duplicate / consolidated reporting)
-- ---------------------------------------------------------------------------
CREATE TABLE public.supporting_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_incident_id UUID NOT NULL REFERENCES public.incidents (id) ON DELETE CASCADE,
  supporting_incident_id UUID NOT NULL REFERENCES public.incidents (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT supporting_reports_unique_pair UNIQUE (parent_incident_id, supporting_incident_id),
  CONSTRAINT supporting_reports_not_self CHECK (parent_incident_id <> supporting_incident_id)
);

CREATE INDEX supporting_reports_parent_idx ON public.supporting_reports (parent_incident_id);
CREATE INDEX supporting_reports_supporting_idx ON public.supporting_reports (supporting_incident_id);

-- ---------------------------------------------------------------------------
-- incident_media
-- ---------------------------------------------------------------------------
CREATE TABLE public.incident_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incidents (id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type public.media_type NOT NULL DEFAULT 'image',
  media_source public.media_source NOT NULL DEFAULT 'citizen_evidence',
  captured_at TIMESTAMPTZ NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX incident_media_incident_id_idx ON public.incident_media (incident_id);
CREATE INDEX incident_media_source_idx ON public.incident_media (media_source);

-- ---------------------------------------------------------------------------
-- incident_status_history (audit trail)
-- ---------------------------------------------------------------------------
CREATE TABLE public.incident_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incidents (id) ON DELETE CASCADE,
  previous_status public.incident_status,
  new_status public.incident_status NOT NULL,
  changed_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX incident_status_history_incident_id_idx
  ON public.incident_status_history (incident_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- authority_assignments
-- ---------------------------------------------------------------------------
CREATE TABLE public.authority_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incidents (id) ON DELETE CASCADE,
  authority_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  assigned_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX authority_assignments_incident_id_idx ON public.authority_assignments (incident_id);
CREATE INDEX authority_assignments_authority_id_idx ON public.authority_assignments (authority_id);
CREATE UNIQUE INDEX authority_assignments_active_unique
  ON public.authority_assignments (incident_id)
  WHERE is_active = TRUE;

-- ---------------------------------------------------------------------------
-- resolution_records
-- ---------------------------------------------------------------------------
CREATE TABLE public.resolution_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL UNIQUE REFERENCES public.incidents (id) ON DELETE CASCADE,
  authority_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  before_media_id UUID REFERENCES public.incident_media (id) ON DELETE SET NULL,
  after_media_id UUID REFERENCES public.incident_media (id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX resolution_records_authority_id_idx ON public.resolution_records (authority_id);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  incident_id UUID REFERENCES public.incidents (id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_user_id_idx ON public.notifications (user_id, created_at DESC);
CREATE INDEX notifications_unread_idx ON public.notifications (user_id)
  WHERE read = FALSE;

-- ---------------------------------------------------------------------------
-- app_config (emergency contacts, duplicate detection thresholds, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER app_config_set_updated_at
  BEFORE UPDATE ON public.app_config
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Views
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.incident_summary AS
SELECT
  i.id,
  i.incident_type,
  i.description,
  i.latitude,
  i.longitude,
  i.location_name,
  i.severity,
  i.status,
  i.submitted_at,
  i.resolved_at,
  i.is_primary,
  i.parent_incident_id,
  (
    SELECT COUNT(*)::INTEGER
    FROM public.supporting_reports sr
    WHERE sr.parent_incident_id = i.id
  ) AS supporting_report_count
FROM public.incidents i
WHERE i.is_primary = TRUE;

COMMENT ON VIEW public.incident_summary IS
  'Primary incidents with supporting report counts for dashboards and public map.';
