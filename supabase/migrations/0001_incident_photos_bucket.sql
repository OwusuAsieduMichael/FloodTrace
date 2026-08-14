-- Incident photo storage bucket: public read (photos are shown on the
-- community incident map), auth-gated write, capped at 10MB / images only.
-- Run this once against the real Supabase project (SQL editor or `supabase db push`).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'incident-photos',
  'incident-photos',
  true,
  10485760, -- 10MB, matches the old Firebase Storage rule
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read access for incident photos"
on storage.objects for select
to public
using (bucket_id = 'incident-photos');

create policy "Authenticated users can upload incident photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'incident-photos');
