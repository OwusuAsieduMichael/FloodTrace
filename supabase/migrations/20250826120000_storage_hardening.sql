-- FloodTrace: storage policy hardening (Phase 8)
-- Citizen incident evidence is append-only (no UPDATE/DELETE policies).
-- Resolution evidence is staff-written and append-only.

CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Admins may remove incident evidence for moderation or GDPR requests.
CREATE POLICY "incident_evidence_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'incident-evidence'
    AND public.is_admin()
  );
