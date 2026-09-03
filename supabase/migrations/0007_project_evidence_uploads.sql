-- FIX: project creation failed outright on this database.
--
-- createProject() inserts a `projects.evidence_urls` column and
-- uploadProjectEvidence() writes to a 'project-evidence' storage bucket. Both
-- were introduced in 0005, which was never applied here, so every insert was
-- rejected with "column evidence_urls does not exist".
--
-- Written idempotently so it is safe to run on a database where 0005 did land.

alter table public.projects
  add column if not exists evidence_urls text[] not null default '{}';

insert into storage.buckets (id, name, public)
values ('project-evidence', 'project-evidence', true)
on conflict (id) do update set public = true;

drop policy if exists "project-evidence: public read" on storage.objects;
create policy "project-evidence: public read"
  on storage.objects for select
  using (bucket_id = 'project-evidence');

drop policy if exists "project-evidence: admin upload" on storage.objects;
create policy "project-evidence: admin upload"
  on storage.objects for insert
  with check (bucket_id = 'project-evidence' and public.is_admin());

drop policy if exists "project-evidence: admin delete" on storage.objects;
create policy "project-evidence: admin delete"
  on storage.objects for delete
  using (bucket_id = 'project-evidence' and public.is_admin());
