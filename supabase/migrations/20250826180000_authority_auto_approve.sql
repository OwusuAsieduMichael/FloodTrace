-- Presentation: auto-approve Authority on signup.
-- Citizens and admins are unchanged: no self-serve admin, ops still require approved status.

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
    selected_authority_status := 'approved';
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

-- Existing pending officers can use the ops dashboard without a separate approval step.
UPDATE public.profiles
SET authority_status = 'approved'
WHERE role = 'authority'
  AND authority_status = 'pending';
