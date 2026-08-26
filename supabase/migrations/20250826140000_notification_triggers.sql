-- FloodTrace: notify reporters when incident status changes

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
BEGIN
  IF TG_OP <> 'UPDATE' OR OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  short_id := UPPER(LEFT(NEW.id::text, 8));
  type_label := CASE NEW.incident_type
    WHEN 'blocked_drain' THEN 'blocked drain'
    ELSE 'flood'
  END;

  IF NEW.status = 'verified' THEN
    notif_type := 'report_verified';
    notif_title := 'Report verified';
    notif_message := 'Your ' || type_label || ' report ' || short_id || ' has been verified by authorities.';
  ELSIF NEW.status = 'assigned' THEN
    notif_type := 'authority_assigned';
    notif_title := 'Authority assigned';
    notif_message := 'An authority team has been assigned to your report ' || short_id || '.';
  ELSIF NEW.status = 'resolved' THEN
    notif_type := 'incident_resolved';
    notif_title := 'Incident resolved';
    notif_message := 'Your ' || type_label || ' report ' || short_id || ' has been marked resolved.';
  ELSIF NEW.status = 'rejected' THEN
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
  AFTER UPDATE OF status ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_incident_status_change();
