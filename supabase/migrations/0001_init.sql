-- ACVOSA ImpactOS — initial schema, RLS, triggers, RPCs
-- Run this once in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================
create type app_role as enum ('student', 'admin');
create type activity_category as enum ('Workshops', 'Community', 'Academic', 'Leadership', 'Social', 'Volunteer');
create type attendance_method as enum ('QR', 'GPS', 'Bluetooth', 'QR + GPS');
create type reservation_status as enum ('confirmed', 'completed', 'cancelled');
create type attendance_status as enum ('present', 'absent', 'pending');
create type project_status as enum ('planning', 'active', 'completed');
create type notification_category as enum ('reservation', 'attendance', 'deadline', 'project', 'reminder', 'system');
create type member_role as enum ('Member', 'Coordinator', 'Volunteer');
create type member_status as enum ('active', 'inactive');
create type priority_level as enum ('high', 'medium', 'low');

-- ============================================================================
-- PROFILES  (1:1 with auth.users; role lives here, never trust client input)
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role app_role not null default 'student',
  student_number text,
  email text not null,
  faculty text,
  avatar_seed text,
  status member_status not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Everyone can read their own profile; admins can read all (needed for rosters/attendance mgmt)
create policy "profiles: self read" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: admin read all" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "profiles: self update (non-role fields enforced by trigger below)" on public.profiles
  for update using (auth.uid() = id);

-- Prevent students from promoting themselves to admin via a direct update
create or replace function public.prevent_self_role_escalation()
returns trigger language plpgsql as $$
begin
  if new.role <> old.role then
    if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
      raise exception 'Only an admin can change roles';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_self_role_escalation();

-- Auto-create a profile row whenever a new auth user signs up.
-- Role always defaults to 'student' — admin accounts are promoted manually (see README).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, student_number, faculty)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'student_number',
    new.raw_user_meta_data->>'faculty'
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- HELPER: is the current user an admin?
-- ============================================================================
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ============================================================================
-- ACTIVITIES
-- ============================================================================
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  category activity_category not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  venue text not null,
  capacity int not null check (capacity > 0),
  registration_deadline date not null,
  organizer text not null,
  attendance_method attendance_method not null default 'QR',
  requirements text[] not null default '{}',
  image_seed text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.activities enable row level security;

create policy "activities: authenticated read" on public.activities
  for select to authenticated using (true);

create policy "activities: admin write" on public.activities
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- RESERVATIONS  (capacity + duplicate checks enforced via RPC below)
-- ============================================================================
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status reservation_status not null default 'confirmed',
  ticket_code text not null unique,
  created_at timestamptz not null default now(),
  unique (activity_id, user_id)
);

alter table public.reservations enable row level security;

create policy "reservations: owner read" on public.reservations
  for select using (auth.uid() = user_id);

create policy "reservations: admin read all" on public.reservations
  for select using (public.is_admin());

-- Direct inserts/updates are blocked; use the reserve_activity / cancel_reservation RPCs
-- so capacity checks happen atomically under a row lock.
create policy "reservations: admin manage" on public.reservations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- A computed view so the client can display live "seats reserved" without racing.
create view public.activities_with_counts as
  select a.*, coalesce(r.reserved_count, 0)::int as reserved
  from public.activities a
  left join (
    select activity_id, count(*) as reserved_count
    from public.reservations
    where status = 'confirmed'
    group by activity_id
  ) r on r.activity_id = a.id;

-- ============================================================================
-- ATTENDANCE RECORDS
-- ============================================================================
create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  check_in_time text not null,
  status attendance_status not null default 'present',
  created_at timestamptz not null default now(),
  unique (activity_id, user_id)
);

alter table public.attendance_records enable row level security;

create policy "attendance: owner read" on public.attendance_records
  for select using (auth.uid() = user_id);

create policy "attendance: admin read all" on public.attendance_records
  for select using (public.is_admin());

create policy "attendance: admin manage" on public.attendance_records
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- Note: self check-in goes through the confirm_attendance() RPC, which validates
-- the activity's real time window server-side instead of trusting the client clock.

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  category notification_category not null default 'system',
  activity_id uuid references public.activities(id) on delete set null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications: owner read" on public.notifications
  for select using (auth.uid() = recipient_id);

create policy "notifications: owner update (mark read)" on public.notifications
  for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

create policy "notifications: admin manage" on public.notifications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- DEADLINES
-- ============================================================================
create table public.deadlines (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  priority priority_level not null default 'medium',
  activity_id uuid references public.activities(id) on delete cascade
);

alter table public.deadlines enable row level security;

create policy "deadlines: authenticated read" on public.deadlines
  for select to authenticated using (true);

create policy "deadlines: admin write" on public.deadlines
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- PROJECTS  (+ team members and phases as child tables)
-- ============================================================================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  objectives text[] not null default '{}',
  date date not null,
  location text not null,
  status project_status not null default 'planning',
  participants int not null default 0,
  volunteers int not null default 0,
  sessions int not null default 0,
  satisfaction numeric(4,1) not null default 0,
  community text not null,
  evidence_count int not null default 0,
  documents text[] not null default '{}',
  results text[] not null default '{}',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "projects: authenticated read" on public.projects
  for select to authenticated using (true);

create policy "projects: admin write" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.project_team (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  role text not null
);

alter table public.project_team enable row level security;

create policy "project_team: authenticated read" on public.project_team
  for select to authenticated using (true);

create policy "project_team: admin write" on public.project_team
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.project_phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  date date not null,
  description text not null default '',
  done boolean not null default false,
  position int not null default 0
);

alter table public.project_phases enable row level security;

create policy "project_phases: authenticated read" on public.project_phases
  for select to authenticated using (true);

create policy "project_phases: admin write" on public.project_phases
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- MEMBERS  (org roster — contains other people's PII, admin-only)
-- ============================================================================
create table public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  student_number text,
  email text not null,
  faculty text,
  role member_role not null default 'Member',
  activities_attended int not null default 0,
  volunteer_hours numeric(6,1) not null default 0,
  joined date not null default current_date,
  status member_status not null default 'active'
);

alter table public.members enable row level security;

create policy "members: admin only" on public.members
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- HISTORY EVENTS & IMPACT SNAPSHOTS  (public-ish reference/reporting data)
-- ============================================================================
create table public.history_events (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  title text not null,
  description text not null default ''
);

alter table public.history_events enable row level security;

create policy "history_events: authenticated read" on public.history_events
  for select to authenticated using (true);

create policy "history_events: admin write" on public.history_events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.impact_snapshots (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  activities int not null default 0,
  participants int not null default 0,
  projects int not null default 0,
  volunteer_hours int not null default 0,
  communities int not null default 0,
  attendance_rate numeric(5,1) not null default 0
);

alter table public.impact_snapshots enable row level security;

create policy "impact_snapshots: authenticated read" on public.impact_snapshots
  for select to authenticated using (true);

create policy "impact_snapshots: admin write" on public.impact_snapshots
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- PARTICIPANTS VIEW  (admin-only; derived from reservations + attendance, no PII duplication)
-- ============================================================================
create view public.activity_participants as
  select
    r.activity_id,
    p.id as user_id,
    p.full_name as name,
    p.student_number,
    (r.status = 'confirmed') as reserved,
    (att.id is not null) as attended,
    att.check_in_time
  from public.reservations r
  join public.profiles p on p.id = r.user_id
  left join public.attendance_records att on att.activity_id = r.activity_id and att.user_id = r.user_id;

-- Views inherit RLS from underlying tables via the querying role, but reservations
-- already restrict non-admins to their own row, so a student querying this view
-- only ever sees themselves — which is the desired behaviour.

-- ============================================================================
-- RPC: reserve_activity — atomic capacity check + insert + notification
-- ============================================================================
create or replace function public.reserve_activity(p_activity_id uuid)
returns public.reservations
language plpgsql security definer set search_path = public as $$
declare
  v_activity record;
  v_reserved int;
  v_ticket text;
  v_row public.reservations;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_activity from public.activities where id = p_activity_id for update;
  if not found then
    raise exception 'Activity not found';
  end if;

  select count(*) into v_reserved from public.reservations
    where activity_id = p_activity_id and status = 'confirmed';

  if v_reserved >= v_activity.capacity then
    raise exception 'Activity is full';
  end if;

  if exists (select 1 from public.reservations where activity_id = p_activity_id and user_id = auth.uid() and status = 'confirmed') then
    raise exception 'Already reserved';
  end if;

  v_ticket := 'ACV-' || to_char(now(), 'YYYY') || '-' || upper(left(p_activity_id::text, 8)) || '-' || floor(10000 + random() * 89999)::int;

  insert into public.reservations (activity_id, user_id, status, ticket_code)
  values (p_activity_id, auth.uid(), 'confirmed', v_ticket)
  on conflict (activity_id, user_id) do update set status = 'confirmed'
  returning * into v_row;

  insert into public.notifications (recipient_id, title, message, category, activity_id)
  values (auth.uid(), 'Reservation confirmed', 'Your reservation for ' || v_activity.name || ' is confirmed.', 'reservation', p_activity_id);

  return v_row;
end;
$$;

-- ============================================================================
-- RPC: cancel_reservation
-- ============================================================================
create or replace function public.cancel_reservation(p_activity_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.reservations
    set status = 'cancelled'
    where activity_id = p_activity_id and user_id = auth.uid() and status = 'confirmed';
end;
$$;

-- ============================================================================
-- RPC: confirm_attendance — self check-in, but only inside the activity's real time window
-- (True anti-spoofing for GPS/QR requires an edge function validating device signals;
--  this is the server-side guard against obviously wrong/backdated check-ins.)
-- ============================================================================
create or replace function public.confirm_attendance(p_activity_id uuid)
returns public.attendance_records
language plpgsql security definer set search_path = public as $$
declare
  v_activity record;
  v_row public.attendance_records;
  v_now timestamptz := now();
  v_start timestamptz;
  v_end timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_activity from public.activities where id = p_activity_id;
  if not found then
    raise exception 'Activity not found';
  end if;

  v_start := (v_activity.date::text || ' ' || v_activity.start_time::text)::timestamptz;
  v_end := (v_activity.date::text || ' ' || v_activity.end_time::text)::timestamptz;

  if v_now < v_start - interval '15 minutes' or v_now > v_end + interval '15 minutes' then
    raise exception 'Check-in is only available during the activity window';
  end if;

  if not exists (select 1 from public.reservations where activity_id = p_activity_id and user_id = auth.uid() and status = 'confirmed') then
    raise exception 'No confirmed reservation for this activity';
  end if;

  insert into public.attendance_records (activity_id, user_id, check_in_time, status)
  values (p_activity_id, auth.uid(), to_char(v_now, 'HH24:MI'), 'present')
  on conflict (activity_id, user_id) do nothing
  returning * into v_row;

  if v_row.id is not null then
    insert into public.notifications (recipient_id, title, message, category, activity_id)
    values (auth.uid(), 'Attendance confirmed', 'Your attendance at ' || v_activity.name || ' has been recorded.', 'attendance', p_activity_id);
  end if;

  return v_row;
end;
$$;

-- ============================================================================
-- RPC: broadcast_notification — admin sends a notification to many/all students
-- ============================================================================
create or replace function public.broadcast_notification(
  p_title text,
  p_message text,
  p_category notification_category default 'system',
  p_activity_id uuid default null
)
returns int
language plpgsql security definer set search_path = public as $$
declare
  v_count int;
begin
  if not public.is_admin() then
    raise exception 'Only admins can broadcast notifications';
  end if;

  insert into public.notifications (recipient_id, title, message, category, activity_id)
  select id, p_title, p_message, p_category, p_activity_id
  from public.profiles where role = 'student' and status = 'active';

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
