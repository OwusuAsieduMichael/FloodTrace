-- Auto-approved Authority signups insert authority_status = 'approved'.
-- Keep the own-row insert policy aligned with handle_new_user().

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    AND role IN ('citizen', 'authority')
    AND (
      (role = 'citizen' AND authority_status IS NULL)
      OR (
        role = 'authority'
        AND authority_status IN ('pending', 'approved')
      )
    )
  );
