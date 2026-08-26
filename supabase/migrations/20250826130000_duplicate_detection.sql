-- FloodTrace: duplicate detection linking (Phase 10)

CREATE OR REPLACE FUNCTION public.link_incident_as_supporting(
  p_supporting_incident_id UUID,
  p_parent_incident_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supporting public.incidents%ROWTYPE;
  v_parent public.incidents%ROWTYPE;
BEGIN
  SELECT * INTO v_supporting
  FROM public.incidents
  WHERE id = p_supporting_incident_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Supporting incident not found';
  END IF;

  IF v_supporting.reporter_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to link this incident';
  END IF;

  IF v_supporting.is_primary IS NOT TRUE THEN
    RAISE EXCEPTION 'Incident is already linked as supporting evidence';
  END IF;

  SELECT * INTO v_parent
  FROM public.incidents
  WHERE id = p_parent_incident_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Parent incident not found';
  END IF;

  IF v_parent.is_primary IS NOT TRUE THEN
    RAISE EXCEPTION 'Parent incident must be primary';
  END IF;

  IF v_parent.incident_type <> v_supporting.incident_type THEN
    RAISE EXCEPTION 'Incident types must match';
  END IF;

  IF v_parent.status IN ('resolved', 'rejected') THEN
    RAISE EXCEPTION 'Parent incident is no longer active';
  END IF;

  IF p_supporting_incident_id = p_parent_incident_id THEN
    RAISE EXCEPTION 'An incident cannot support itself';
  END IF;

  UPDATE public.incidents
  SET
    is_primary = FALSE,
    parent_incident_id = p_parent_incident_id
  WHERE id = p_supporting_incident_id;

  INSERT INTO public.supporting_reports (parent_incident_id, supporting_incident_id)
  VALUES (p_parent_incident_id, p_supporting_incident_id)
  ON CONFLICT (parent_incident_id, supporting_incident_id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.link_incident_as_supporting(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_incident_as_supporting(UUID, UUID) TO authenticated;
