-- ============================================================================
-- REUSABLE GEOFENCED VENUES
-- An admin geofences a place once, then picks it when creating activities
-- instead of re-placing a pin every time.
--
-- An activity resolves its fence from its venue when venue_id is set, and falls
-- back to its own venue_lat/venue_lng for one-off locations. That keeps the
-- per-activity override from 0008 working, and means editing a venue's pin
-- updates every future activity held there.
-- ============================================================================

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text not null default '',
  lat double precision not null,
  lng double precision not null,
  geofence_radius_m int not null default 250
    check (geofence_radius_m between 25 and 5000),
  capacity int check (capacity is null or capacity > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.venues enable row level security;

create policy "venues: authenticated read" on public.venues
  for select to authenticated using (true);

create policy "venues: admin write" on public.venues
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- restrict, not set null: silently dropping an activity's geofence because
-- someone tidied up a venue would be worse than refusing the delete.
alter table public.activities
  add column if not exists venue_id uuid references public.venues(id) on delete restrict;

create index if not exists activities_venue_id_idx on public.activities (venue_id);

-- Resolve the effective fence in one place so the view, the app and
-- confirm_attendance cannot drift apart.
create or replace function public.activity_geofence(p_activity_id uuid)
returns table (lat double precision, lng double precision, radius_m int, label text)
language sql stable security definer set search_path = public as $$
  select
    case when a.venue_id is not null then v.lat else a.venue_lat end,
    case when a.venue_id is not null then v.lng else a.venue_lng end,
    case when a.venue_id is not null then v.geofence_radius_m else a.geofence_radius_m end,
    coalesce(v.name, a.venue)
  from public.activities a
  left join public.venues v on v.id = a.venue_id
  where a.id = p_activity_id;
$$;

drop view if exists public.activities_with_counts;

create view public.activities_with_counts as
  select
    a.*,
    v.name as venue_name,
    case when a.venue_id is not null then v.lat else a.venue_lat end as geofence_lat,
    case when a.venue_id is not null then v.lng else a.venue_lng end as geofence_lng,
    case when a.venue_id is not null then v.geofence_radius_m else a.geofence_radius_m end as geofence_radius,
    coalesce(r.reserved_count, 0)::int as reserved,
    coalesce(att.attended_count, 0)::int as attended_count,
    greatest(coalesce(r.reserved_count, 0) - coalesce(att.attended_count, 0), 0)::int as no_show_count
  from public.activities a
  left join public.venues v on v.id = a.venue_id
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

-- confirm_attendance now checks against the resolved fence rather than the
-- activity's own columns.
create or replace function public.confirm_attendance(
  p_activity_id uuid,
  p_code text,
  p_lat double precision default null,
  p_lng double precision default null,
  p_accuracy_m double precision default null
)
returns public.attendance_records
language plpgsql security definer set search_path = public as $$
declare
  v_activity record;
  v_fence record;
  v_row public.attendance_records;
  v_now timestamptz := now();
  v_start timestamptz;
  v_end timestamptz;
  v_distance double precision;
  v_allowance double precision;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_activity from public.activities where id = p_activity_id;
  if not found then
    raise exception 'Activity not found';
  end if;

  if v_activity.attendance_code is null then
    raise exception 'No attendance QR code has been generated for this activity yet';
  end if;

  if p_code is null or upper(trim(p_code)) <> v_activity.attendance_code then
    raise exception 'Invalid or expired QR code';
  end if;

  v_start := (v_activity.date::text || ' ' || v_activity.start_time::text)::timestamp at time zone 'Africa/Johannesburg';
  v_end := (v_activity.date::text || ' ' || v_activity.end_time::text)::timestamp at time zone 'Africa/Johannesburg';

  if v_now < v_start - interval '15 minutes' or v_now > v_end + interval '15 minutes' then
    raise exception 'Check-in is only available during the activity window';
  end if;

  if not exists (select 1 from public.reservations where activity_id = p_activity_id and user_id = auth.uid() and status = 'confirmed') then
    raise exception 'No confirmed reservation for this activity';
  end if;

  select * into v_fence from public.activity_geofence(p_activity_id);

  if v_fence.lat is not null and v_fence.lng is not null then
    if p_lat is null or p_lng is null then
      raise exception 'Location required: allow location access to check in at this venue';
    end if;

    v_distance := public.geo_distance_m(v_fence.lat, v_fence.lng, p_lat, p_lng);
    v_allowance := v_fence.radius_m + least(coalesce(p_accuracy_m, 0), 100);

    if v_distance > v_allowance then
      raise exception 'You appear to be % m from %, outside the % m check-in area',
        round(v_distance)::int, v_fence.label, v_fence.radius_m;
    end if;
  end if;

  insert into public.attendance_records
    (activity_id, user_id, check_in_time, status, check_in_lat, check_in_lng, check_in_distance_m)
  values
    (p_activity_id, auth.uid(), to_char(v_now at time zone 'Africa/Johannesburg', 'HH24:MI'), 'present',
     p_lat, p_lng, round(v_distance)::int)
  on conflict (activity_id, user_id) do nothing
  returning * into v_row;

  if v_row.id is not null then
    insert into public.notifications (recipient_id, title, message, category, activity_id)
    values (auth.uid(), 'Attendance confirmed', 'Your attendance at ' || v_activity.name || ' has been recorded.', 'attendance', p_activity_id);
  end if;

  return v_row;
end;
$$;
