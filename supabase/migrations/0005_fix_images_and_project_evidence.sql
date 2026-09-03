-- ============================================================================
-- FIX: activities_with_counts uses `a.*`, which Postgres expands and freezes
-- at the moment the view is (re)created. Migration 0004 added `image_url` to
-- the activities table AFTER this view was last created in 0002, so the view
-- never picked it up — uploaded images saved correctly to the table but the
-- app (which reads through this view) always got `image_url: null`. Recreating
-- the view with the same definition forces Postgres to re-expand `a.*` and
-- include the new column.
--
-- NOTE: this must be DROP + CREATE, not CREATE OR REPLACE. `image_url` expands
-- in the middle of `a.*`, ahead of the reserved/attended_count/no_show_count
-- columns, and CREATE OR REPLACE refuses to rename or reorder existing view
-- columns ("cannot change name of view column"). The grant is reissued because
-- dropping the view drops its privileges with it.
-- ============================================================================
drop view if exists public.activities_with_counts;

create view public.activities_with_counts as
  select
    a.*,
    coalesce(r.reserved_count, 0)::int as reserved,
    coalesce(att.attended_count, 0)::int as attended_count,
    greatest(coalesce(r.reserved_count, 0) - coalesce(att.attended_count, 0), 0)::int as no_show_count
  from public.activities a
  left join (
    select activity_id, count(*) as reserved_count
    from public.reservations
    where status = 'confirmed'
    group by activity_id
  ) r on r.activity_id = a.id
  left join (
    select activity_id, count(*) as attended_count
    from public.attendance_records
    where status = 'present'
    group by activity_id
  ) att on att.activity_id = a.id;

grant select on public.activities_with_counts to anon, authenticated, service_role;

-- Belt-and-braces: force the activity-images bucket to actually be public,
-- in case it already existed (e.g. from a partial earlier run) with
-- public = false, which `on conflict do nothing` would have left untouched.
update storage.buckets set public = true where id = 'activity-images';

-- ============================================================================
-- PROJECT EVIDENCE UPLOADS
-- Real photo evidence per project, replacing the placeholder icon grid that
-- was only ever driven by a plain count.
-- ============================================================================
alter table public.projects
  add column if not exists evidence_urls text[] not null default '{}';

insert into storage.buckets (id, name, public)
values ('project-evidence', 'project-evidence', true)
on conflict (id) do update set public = true;

create policy "project-evidence: public read"
  on storage.objects for select
  using (bucket_id = 'project-evidence');

create policy "project-evidence: admin upload"
  on storage.objects for insert
  with check (bucket_id = 'project-evidence' and public.is_admin());

create policy "project-evidence: admin delete"
  on storage.objects for delete
  using (bucket_id = 'project-evidence' and public.is_admin());
