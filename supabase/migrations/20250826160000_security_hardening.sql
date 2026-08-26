-- FloodTrace: Phase 19 security hardening
-- 1) Never accept admin self-registration via auth metadata
-- 2) Notification inserts are staff/service-role only (citizens cannot forge inbox rows)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_role public.user_role;
  selected_authority_status public.authority_status;
  requested_role TEXT;
BEGIN
  requested_role := NEW.raw_user_meta_data ->> 'role';

  IF requested_role = 'authority' THEN
    selected_role := 'authority';
    selected_authority_status := 'pending';
  ELSE
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

DROP POLICY IF EXISTS "notifications_insert_system" ON public.notifications;
CREATE POLICY "notifications_insert_staff"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.is_operational_staff());
