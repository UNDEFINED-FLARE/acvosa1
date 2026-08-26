-- ============================================================================
-- ACTIVITY IMAGE UPLOADS
-- Admins can now upload a real photo for an activity instead of relying only
-- on the category-based icon placeholder. Adds a storage bucket + an
-- image_url column; the icon placeholder remains the fallback when no image
-- has been uploaded.
-- ============================================================================

alter table public.activities
  add column if not exists image_url text;

-- Public bucket: activity photos are meant to be visible to anyone browsing
-- activities (including on the public-facing parts of the app), so reads are
-- unauthenticated; only admins can write.
insert into storage.buckets (id, name, public)
values ('activity-images', 'activity-images', true)
on conflict (id) do nothing;

create policy "activity-images: public read"
  on storage.objects for select
  using (bucket_id = 'activity-images');

create policy "activity-images: admin upload"
  on storage.objects for insert
  with check (bucket_id = 'activity-images' and public.is_admin());

create policy "activity-images: admin update"
  on storage.objects for update
  using (bucket_id = 'activity-images' and public.is_admin());

create policy "activity-images: admin delete"
  on storage.objects for delete
  using (bucket_id = 'activity-images' and public.is_admin());
