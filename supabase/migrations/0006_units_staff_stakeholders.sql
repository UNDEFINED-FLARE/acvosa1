-- Institute for Rural Development — organisational units, unit staff, external stakeholders.
-- Also rebrands the reservation ticket prefix from ACV- to IRD-.

-- ============================================================================
-- ENUM TYPES
-- ============================================================================
create type unit_staff_category as enum (
  'Permanent Staff',
  'Postgraduate Committee',
  'Innovation Champion',
  'Graduate Trainee',
  'Intern',
  'Research Assistant'
);

create type stakeholder_type as enum (
  'Government',
  'Academic',
  'NGO',
  'Industry',
  'Funder',
  'Community',
  'International'
);

create type stakeholder_status as enum ('active', 'pending', 'dormant');

-- ============================================================================
-- UNITS
-- ============================================================================
create table public.units (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  short_name text not null,
  focus text not null default '',
  description text not null default '',
  lead text,
  email text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.units enable row level security;

create policy "units: authenticated read" on public.units
  for select to authenticated using (true);

create policy "units: admin write" on public.units
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- UNIT STAFF  (permanent staff, postgraduate committee, innovation champions,
--              graduate trainees, interns and research assistants per unit)
-- ============================================================================
create table public.unit_staff (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  name text not null,
  category unit_staff_category not null,
  title text,
  email text,
  focus text,
  status member_status not null default 'active',
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index unit_staff_unit_id_idx on public.unit_staff (unit_id);
create index unit_staff_category_idx on public.unit_staff (category);

alter table public.unit_staff enable row level security;

create policy "unit_staff: authenticated read" on public.unit_staff
  for select to authenticated using (true);

create policy "unit_staff: admin write" on public.unit_staff
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- STAKEHOLDERS  (external relationships)
-- ============================================================================
create table public.stakeholders (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type stakeholder_type not null,
  relationship text not null default '',
  focus text,
  contact_person text,
  contact_email text,
  since text,
  status stakeholder_status not null default 'active',
  unit_id uuid references public.units(id) on delete set null,
  created_at timestamptz not null default now()
);

create index stakeholders_unit_id_idx on public.stakeholders (unit_id);

alter table public.stakeholders enable row level security;

create policy "stakeholders: authenticated read" on public.stakeholders
  for select to authenticated using (true);

create policy "stakeholders: admin write" on public.stakeholders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- REBRAND: reservation ticket prefix ACV- -> IRD-
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

  v_ticket := 'IRD-' || to_char(now(), 'YYYY') || '-' || upper(left(p_activity_id::text, 8)) || '-' || floor(10000 + random() * 89999)::int;

  insert into public.reservations (activity_id, user_id, status, ticket_code)
  values (p_activity_id, auth.uid(), 'confirmed', v_ticket)
  on conflict (activity_id, user_id) do update set status = 'confirmed'
  returning * into v_row;

  insert into public.notifications (recipient_id, title, message, category, activity_id)
  values (auth.uid(), 'Reservation confirmed', 'Your reservation for ' || v_activity.name || ' is confirmed.', 'reservation', p_activity_id);

  return v_row;
end;
$$;

