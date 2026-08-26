-- FloodTrace: storage buckets and policies

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'incident-evidence',
    'incident-evidence',
    FALSE,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'resolution-evidence',
    'resolution-evidence',
    FALSE,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'avatars',
    'avatars',
    TRUE,
    2097152,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- incident-evidence: citizens upload to own folder; staff can read
CREATE POLICY "incident_evidence_insert_citizen"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'incident-evidence'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "incident_evidence_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'incident-evidence'
    AND (
      public.is_operational_staff()
      OR (storage.foldername(name))[1] = auth.uid()::TEXT
    )
  );

-- resolution-evidence: approved authority only
CREATE POLICY "resolution_evidence_insert_staff"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resolution-evidence'
    AND public.is_operational_staff()
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "resolution_evidence_select_authenticated"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'resolution-evidence');

-- avatars: users manage own avatar
CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "avatars_select_public"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
