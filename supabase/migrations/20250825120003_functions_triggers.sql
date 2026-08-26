-- FloodTrace: auth triggers, status history, initial config

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_role public.user_role;
  selected_authority_status public.authority_status;
BEGIN
  selected_role := COALESCE(
    (NEW.raw_user_meta_data ->> 'role')::public.user_role,
    'citizen'
  );

  IF selected_role = 'authority' THEN
    selected_authority_status := 'pending';
  ELSIF selected_role = 'admin' THEN
    selected_authority_status := 'approved';
  ELSE
    selected_authority_status := NULL;
  END IF;

  -- Prevent self-registration as admin via client metadata
  IF selected_role = 'admin' THEN
    selected_role := 'citizen';
    selected_authority_status := NULL;
  END IF;

  INSERT INTO public.profiles (id, full_name, phone, role, authority_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'phone',
    selected_role,
    selected_authority_status
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Record incident status transitions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_incident_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'assigned' AND NEW.assigned_to IS NULL THEN
      RAISE EXCEPTION 'assigned_to is required when status is assigned';
    END IF;

    IF NEW.status = 'resolved' AND NEW.resolved_at IS NULL THEN
      NEW.resolved_at := NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER incidents_validate_status
  BEFORE UPDATE OF status ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_incident_status_change();

CREATE OR REPLACE FUNCTION public.record_incident_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.incident_status_history (
      incident_id,
      previous_status,
      new_status,
      changed_by,
      comment
    )
    VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      NEW.verification_notes
    );
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.incident_status_history (
      incident_id,
      previous_status,
      new_status,
      changed_by,
      comment
    )
    VALUES (
      NEW.id,
      NULL,
      NEW.status,
      NEW.reporter_id,
      'Initial submission'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER incidents_status_history
  AFTER INSERT OR UPDATE OF status ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.record_incident_status_change();

-- ---------------------------------------------------------------------------
-- Default application configuration
-- ---------------------------------------------------------------------------
INSERT INTO public.app_config (key, value, description)
VALUES
  (
    'emergency_contacts',
    '[
      {"name": "NADMO", "phone": "", "description": "National Disaster Management Organisation"},
      {"name": "Ghana National Fire Service", "phone": "", "description": "Fire and rescue emergencies"},
      {"name": "Ghana Police Service", "phone": "", "description": "Police emergencies"},
      {"name": "National Ambulance Service", "phone": "", "description": "Medical emergencies"}
    ]'::JSONB,
    'Configurable emergency contact numbers. Update phone values before production use.'
  ),
  (
    'duplicate_detection',
    '{"radius_meters": 150, "time_window_minutes": 30}'::JSONB,
    'Deterministic duplicate detection thresholds'
  )
ON CONFLICT (key) DO NOTHING;

-- Enable Realtime for notifications (Phase 13)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;
