-- ============================================================================
-- GEOFENCED ATTENDANCE
-- An activity can carry a venue coordinate + radius; check-in is then only
-- accepted from inside that circle.
--
-- The check lives HERE, server-side. Browser geolocation is client-supplied and
-- trivially spoofed (devtools sensors, mock-location apps), so the map the
-- student sees is a convenience for them, never the thing that decides.
-- ============================================================================

alter table public.activities
  add column if not exists venue_lat double precision,
  add column if not exists venue_lng double precision,
  add column if not exists geofence_radius_m int not null default 250
    check (geofence_radius_m between 25 and 5000);

-- Audit trail: where the student actually was when they checked in.
alter table public.attendance_records
  add column if not exists check_in_lat double precision,
  add column if not exists check_in_lng double precision,
  add column if not exists check_in_distance_m double precision;

-- Haversine great-circle distance in metres. Avoids needing the cube/earthdistance
-- extensions for what is a single point-to-point check.
create or replace function public.geo_distance_m(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
) returns double precision
language sql immutable parallel safe as $$
  select 2 * 6371000 * asin(least(1, sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
  )));
$$;

-- The 2-arg version has to go: adding defaulted params to it instead would make
-- confirm_attendance(uuid, text) an ambiguous overload.
drop function if exists public.confirm_attendance(uuid, text);

create function public.confirm_attendance(
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

  -- Geofence, only when the activity has one configured.
  if v_activity.venue_lat is not null and v_activity.venue_lng is not null then
    if p_lat is null or p_lng is null then
      raise exception 'Location required: allow location access to check in at this venue';
    end if;

    v_distance := public.geo_distance_m(v_activity.venue_lat, v_activity.venue_lng, p_lat, p_lng);

    -- Forgive GPS noise up to 100m, so a poor fix indoors doesn't block a
    -- student who is genuinely present.
    v_allowance := v_activity.geofence_radius_m + least(coalesce(p_accuracy_m, 0), 100);

    if v_distance > v_allowance then
      raise exception 'You appear to be % m from %, outside the % m check-in area',
        round(v_distance)::int, v_activity.venue, v_activity.geofence_radius_m;
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

-- a.* froze the column list again; rebuild so the new venue columns are exposed.
-- (Must be DROP + CREATE — see the note in 0005.)
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
