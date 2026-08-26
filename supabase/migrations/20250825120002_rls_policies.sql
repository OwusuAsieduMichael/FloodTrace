-- FloodTrace: security helper functions and RLS policies

-- ---------------------------------------------------------------------------
-- Helper functions (security definer, stable)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_authority_status()
RETURNS public.authority_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT authority_status FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_approved_authority()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'authority'
      AND authority_status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_operational_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR public.is_approved_authority();
$$;

CREATE OR REPLACE FUNCTION public.is_public_incident_status(s public.incident_status)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT s IN ('verified', 'assigned', 'resolved');
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supporting_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authority_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolution_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_operational_staff());

CREATE POLICY "profiles_select_public_authority_names"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (role = 'authority' AND authority_status = 'approved');

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    AND role IN ('citizen', 'authority')
    AND (
      (role = 'citizen' AND authority_status IS NULL)
      OR (role = 'authority' AND authority_status = 'pending')
    )
  );

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND authority_status IS NOT DISTINCT FROM (
      SELECT p.authority_status FROM public.profiles p WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- incidents
-- ---------------------------------------------------------------------------
CREATE POLICY "incidents_insert_citizen"
  ON public.incidents FOR INSERT
  TO authenticated
  WITH CHECK (
    reporter_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'citizen'
    )
    AND status = 'submitted'
  );

CREATE POLICY "incidents_select_own"
  ON public.incidents FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

CREATE POLICY "incidents_select_public"
  ON public.incidents FOR SELECT
  TO authenticated
  USING (
    is_primary = TRUE
    AND public.is_public_incident_status(status)
  );

CREATE POLICY "incidents_select_staff"
  ON public.incidents FOR SELECT
  TO authenticated
  USING (public.is_operational_staff());

CREATE POLICY "incidents_update_staff"
  ON public.incidents FOR UPDATE
  TO authenticated
  USING (public.is_operational_staff())
  WITH CHECK (public.is_operational_staff());

-- Anonymous public map: verified+ incidents without reporter PII (via view/API later)
CREATE POLICY "incidents_select_anon_public"
  ON public.incidents FOR SELECT
  TO anon
  USING (
    is_primary = TRUE
    AND public.is_public_incident_status(status)
  );

-- ---------------------------------------------------------------------------
-- supporting_reports
-- ---------------------------------------------------------------------------
CREATE POLICY "supporting_reports_select"
  ON public.supporting_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = supporting_reports.supporting_incident_id
        AND i.reporter_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = supporting_reports.parent_incident_id
        AND i.reporter_id = auth.uid()
    )
    OR public.is_operational_staff()
  );

CREATE POLICY "supporting_reports_insert_staff"
  ON public.supporting_reports FOR INSERT
  TO authenticated
  WITH CHECK (public.is_operational_staff());

-- ---------------------------------------------------------------------------
-- incident_media
-- ---------------------------------------------------------------------------
CREATE POLICY "incident_media_select_own_incident"
  ON public.incident_media FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = incident_media.incident_id
        AND i.reporter_id = auth.uid()
    )
    OR public.is_operational_staff()
    OR (
      media_source = 'citizen_evidence'
      AND EXISTS (
        SELECT 1 FROM public.incidents i
        WHERE i.id = incident_media.incident_id
          AND i.is_primary = TRUE
          AND public.is_public_incident_status(i.status)
      )
    )
  );

CREATE POLICY "incident_media_insert_citizen"
  ON public.incident_media FOR INSERT
  TO authenticated
  WITH CHECK (
    media_source = 'citizen_evidence'
    AND EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = incident_media.incident_id
        AND i.reporter_id = auth.uid()
    )
  );

CREATE POLICY "incident_media_insert_staff_resolution"
  ON public.incident_media FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_operational_staff()
    AND media_source = 'authority_resolution'
  );

CREATE POLICY "incident_media_select_anon_public"
  ON public.incident_media FOR SELECT
  TO anon
  USING (
    media_source = 'citizen_evidence'
    AND EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = incident_media.incident_id
        AND i.is_primary = TRUE
        AND public.is_public_incident_status(i.status)
    )
  );

-- ---------------------------------------------------------------------------
-- incident_status_history
-- ---------------------------------------------------------------------------
CREATE POLICY "incident_status_history_select_own"
  ON public.incident_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = incident_status_history.incident_id
        AND i.reporter_id = auth.uid()
    )
    OR public.is_operational_staff()
  );

CREATE POLICY "incident_status_history_insert_staff"
  ON public.incident_status_history FOR INSERT
  TO authenticated
  WITH CHECK (public.is_operational_staff() OR changed_by = auth.uid());

-- ---------------------------------------------------------------------------
-- authority_assignments
-- ---------------------------------------------------------------------------
CREATE POLICY "authority_assignments_select_staff"
  ON public.authority_assignments FOR SELECT
  TO authenticated
  USING (
    public.is_operational_staff()
    OR authority_id = auth.uid()
  );

CREATE POLICY "authority_assignments_insert_staff"
  ON public.authority_assignments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_operational_staff());

CREATE POLICY "authority_assignments_update_staff"
  ON public.authority_assignments FOR UPDATE
  TO authenticated
  USING (public.is_operational_staff())
  WITH CHECK (public.is_operational_staff());

-- ---------------------------------------------------------------------------
-- resolution_records
-- ---------------------------------------------------------------------------
CREATE POLICY "resolution_records_select_public"
  ON public.resolution_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = resolution_records.incident_id
        AND (
          i.reporter_id = auth.uid()
          OR public.is_public_incident_status(i.status)
        )
    )
    OR public.is_operational_staff()
  );

CREATE POLICY "resolution_records_select_anon"
  ON public.resolution_records FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = resolution_records.incident_id
        AND public.is_public_incident_status(i.status)
    )
  );

CREATE POLICY "resolution_records_insert_staff"
  ON public.resolution_records FOR INSERT
  TO authenticated
  WITH CHECK (public.is_operational_staff() AND authority_id = auth.uid());

CREATE POLICY "resolution_records_update_staff"
  ON public.resolution_records FOR UPDATE
  TO authenticated
  USING (public.is_operational_staff())
  WITH CHECK (public.is_operational_staff());

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_insert_system"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.is_operational_staff() OR user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- app_config
-- ---------------------------------------------------------------------------
CREATE POLICY "app_config_select_authenticated"
  ON public.app_config FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "app_config_select_anon_emergency"
  ON public.app_config FOR SELECT
  TO anon
  USING (key IN ('emergency_contacts', 'duplicate_detection'));

CREATE POLICY "app_config_admin_write"
  ON public.app_config FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
