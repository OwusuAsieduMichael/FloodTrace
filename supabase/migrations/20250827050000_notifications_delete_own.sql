-- Allow each user to remove their own inbox rows.
-- FULL replica identity so Realtime DELETE events include user_id for RLS.

ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
