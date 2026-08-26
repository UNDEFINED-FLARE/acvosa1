-- ============================================================================
-- FIX: confirm_attendance was comparing the activity's local wall-clock time
-- window against `now()` using the database session's default timezone (UTC
-- on Supabase), instead of South Africa time. Activities created for e.g.
-- "09:00–12:00" were effectively being checked against 09:00–12:00 UTC
-- (11:00–14:00 SAST), silently rejecting valid QR scans made during the
-- actual activity — or accepting scans 2 hours off. This explicitly
-- interprets activity date/time as Africa/Johannesburg (SAST, UTC+2, no DST).
-- ============================================================================
create or replace function public.confirm_attendance(p_activity_id uuid, p_code text)
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

  insert into public.attendance_records (activity_id, user_id, check_in_time, status)
  values (p_activity_id, auth.uid(), to_char(v_now at time zone 'Africa/Johannesburg', 'HH24:MI'), 'present')
  on conflict (activity_id, user_id) do nothing
  returning * into v_row;

  if v_row.id is not null then
    insert into public.notifications (recipient_id, title, message, category, activity_id)
    values (auth.uid(), 'Attendance confirmed', 'Your attendance at ' || v_activity.name || ' has been recorded.', 'attendance', p_activity_id);
  end if;

  return v_row;
end;
$$;
