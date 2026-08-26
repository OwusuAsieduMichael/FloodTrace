-- FloodTrace: allow public incidents to expose authority resolution media
-- so before/after documentation is visible to reporters and authenticated viewers.

DROP POLICY IF EXISTS "incident_media_select_own_incident" ON public.incident_media;
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
    OR EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = incident_media.incident_id
        AND i.is_primary = TRUE
        AND public.is_public_incident_status(i.status)
    )
  );

DROP POLICY IF EXISTS "incident_media_select_anon_public" ON public.incident_media;
CREATE POLICY "incident_media_select_anon_public"
  ON public.incident_media FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = incident_media.incident_id
        AND i.is_primary = TRUE
        AND public.is_public_incident_status(i.status)
    )
  );
