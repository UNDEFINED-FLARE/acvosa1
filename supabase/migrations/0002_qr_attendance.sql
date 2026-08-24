-- ============================================================================
-- QR-ONLY ATTENDANCE
-- Attendance can now only be confirmed by scanning a one-time QR code that the
-- admin generates per activity. The code is stored server-side on the activity
-- and confirm_attendance() now requires it to match before recording a check-in.
-- ============================================================================

alter table public.activities
  add column if not exists attendance_code text;

-- ============================================================================
-- RPC: generate_attendance_code — admin generates/regenerates the QR code for
-- an activity. Returns the new code so the client can render the QR image.
-- ============================================================================
create or replace function public.generate_attendance_code(p_activity_id uuid)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_code text;
begin
  if not public.is_admin() then
    raise exception 'Only admins can generate attendance codes';
  end if;

  if not exists (select 1 from public.activities where id = p_activity_id) then
    raise exception 'Activity not found';
  end if;

  -- 8-character random alphanumeric code
  v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

  update public.activities set attendance_code = v_code where id = p_activity_id;

  return v_code;
end;
$$;

-- ============================================================================
-- RPC: confirm_attendance — self check-in via QR scan only.
-- The scanned code must match the activity's current attendance_code, in
-- addition to the existing time-window and reservation checks.
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
-- Real attendance/no-show counts, so the client never has to fabricate them.
-- ============================================================================
create or replace view public.activities_with_counts as
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
