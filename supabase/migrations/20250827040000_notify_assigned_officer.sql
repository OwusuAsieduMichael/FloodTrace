-- Include the assigned officer's name in citizen assignment and resolution alerts.

CREATE OR REPLACE FUNCTION public.notify_incident_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  short_id TEXT;
  type_label TEXT;
  notif_type TEXT;
  notif_title TEXT;
  notif_message TEXT;
  officer_name TEXT;
  officer_label TEXT;
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN NEW;
  END IF;

  IF OLD.status IS NOT DISTINCT FROM NEW.status
     AND OLD.assigned_to IS NOT DISTINCT FROM NEW.assigned_to THEN
    RETURN NEW;
  END IF;

  short_id := UPPER(LEFT(NEW.id::text, 8));
  type_label := CASE NEW.incident_type
    WHEN 'blocked_drain' THEN 'blocked drain'
    ELSE 'flood'
  END;

  officer_label := 'an assigned officer';

  IF NEW.assigned_to IS NOT NULL THEN
    SELECT NULLIF(BTRIM(full_name), '')
    INTO officer_name
    FROM public.profiles
    WHERE id = NEW.assigned_to;

    IF officer_name IS NOT NULL THEN
      officer_label := LEFT(officer_name, 80);
    END IF;
  END IF;

  IF NEW.status = 'verified' AND OLD.status IS DISTINCT FROM NEW.status THEN
    notif_type := 'report_verified';
    notif_title := 'Report verified';
    notif_message := 'Your ' || type_label || ' report ' || short_id || ' has been verified by authorities.';
  ELSIF NEW.status = 'assigned'
        AND (
          OLD.status IS DISTINCT FROM NEW.status
          OR OLD.assigned_to IS DISTINCT FROM NEW.assigned_to
        ) THEN
    notif_type := 'authority_assigned';
    IF OLD.status = 'assigned' AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      notif_title := 'Officer reassigned';
      notif_message := 'Your ' || type_label || ' report ' || short_id
        || ' has been reassigned to ' || officer_label || '.';
    ELSE
      notif_title := 'Authority assigned';
      notif_message := 'Your ' || type_label || ' report ' || short_id
        || ' has been assigned to ' || officer_label || '.';
    END IF;
  ELSIF NEW.status = 'resolved' AND OLD.status IS DISTINCT FROM NEW.status THEN
    notif_type := 'incident_resolved';
    notif_title := 'Incident resolved';
    IF NEW.assigned_to IS NOT NULL THEN
      notif_message := 'Your ' || type_label || ' report ' || short_id
        || ' has been marked resolved. Officer ' || officer_label
        || ' handled the response.';
    ELSE
      notif_message := 'Your ' || type_label || ' report ' || short_id
        || ' has been marked resolved.';
    END IF;
  ELSIF NEW.status = 'rejected' AND OLD.status IS DISTINCT FROM NEW.status THEN
    notif_type := 'report_rejected';
    notif_title := 'Report not verified';
    notif_message := 'Your report ' || short_id || ' was not verified. Check the report for authority notes.';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, incident_id, type, title, message)
  VALUES (NEW.reporter_id, NEW.id, notif_type, notif_title, notif_message);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS incidents_notify_status ON public.incidents;

CREATE TRIGGER incidents_notify_status
  AFTER UPDATE OF status, assigned_to ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_incident_status_change();
