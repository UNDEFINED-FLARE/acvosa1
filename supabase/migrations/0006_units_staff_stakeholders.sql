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

-- ============================================================================
-- SEED: units
-- ============================================================================
insert into public.units (name, short_name, focus, description, lead, email, position) values
  (
    'Rural Innovation and Enterprise Development',
    'Innovation & Enterprise',
    'Enterprise incubation, innovation champions, technology transfer',
    'Supports rural entrepreneurs and student ventures through incubation, business development and technology transfer, and coordinates the Institute''s innovation champion network.',
    'Prof. M. Rambau',
    'innovation.ird@univen.ac.za',
    1
  ),
  (
    'Agri-Food Systems and Nutrition Security',
    'Agri-Food & Nutrition',
    'Smallholder production, food systems, household nutrition',
    'Researches smallholder production systems, value chains and household nutrition security across the Vhembe and Mopani districts.',
    'Dr. L. Netshandama',
    'agrifood.ird@univen.ac.za',
    2
  ),
  (
    'Rural Governance and Community Development',
    'Governance & Community',
    'Local governance, participation, community development',
    'Works with traditional councils, municipalities and community structures on participatory governance and locally led development.',
    'Dr. T. Nemakonde',
    'governance.ird@univen.ac.za',
    3
  ),
  (
    'Climate Change and Natural Resource Management',
    'Climate & Resources',
    'Climate adaptation, water, land and biodiversity',
    'Builds climate resilience in rural communities through adaptation research, water resource management and sustainable land use.',
    'Prof. S. Mudau',
    'climate.ird@univen.ac.za',
    4
  ),
  (
    'Postgraduate Training and Research Support',
    'Postgraduate Training',
    'Supervision, research methods, postgraduate committee',
    'Coordinates postgraduate supervision, research methodology training and the Institute''s postgraduate committee, and hosts graduate trainees and interns.',
    'Dr. K. Mulaudzi',
    'postgrad.ird@univen.ac.za',
    5
  ),
  (
    'Knowledge Management and Community Engagement',
    'Knowledge & Engagement',
    'Publications, outreach, stakeholder relations',
    'Manages the Institute''s knowledge products, community engagement programmes and relationships with external stakeholders.',
    'Ms. R. Nesengani',
    'engagement.ird@univen.ac.za',
    6
  )
on conflict (name) do nothing;

-- ============================================================================
-- SEED: unit staff
-- ============================================================================
insert into public.unit_staff (unit_id, name, category, title, email, focus, position)
select u.id, s.name, s.category::unit_staff_category, s.title, s.email, s.focus, s.position
from (values
  -- Rural Innovation and Enterprise Development
  ('Rural Innovation and Enterprise Development', 'Prof. M. Rambau', 'Permanent Staff', 'Unit Head & Chief Researcher', 'm.rambau@univen.ac.za', 'Rural enterprise development', 1),
  ('Rural Innovation and Enterprise Development', 'Dr. P. Sigwadi', 'Permanent Staff', 'Senior Researcher', 'p.sigwadi@univen.ac.za', 'Technology transfer', 2),
  ('Rural Innovation and Enterprise Development', 'Mr. T. Baloyi', 'Innovation Champion', 'Innovation Champion', 't.baloyi@univen.ac.za', 'Student venture incubation', 3),
  ('Rural Innovation and Enterprise Development', 'Ms. N. Maluleke', 'Innovation Champion', 'Innovation Champion', 'n.maluleke@univen.ac.za', 'Agri-tech prototyping', 4),
  ('Rural Innovation and Enterprise Development', 'Mr. K. Ramaru', 'Graduate Trainee', 'Graduate Trainee', 'k.ramaru@univen.ac.za', 'Enterprise support services', 5),
  ('Rural Innovation and Enterprise Development', 'Ms. A. Netshivhale', 'Intern', 'Intern', 'a.netshivhale@univen.ac.za', 'Incubation administration', 6),
  ('Rural Innovation and Enterprise Development', 'Mr. D. Chauke', 'Research Assistant', 'Research Assistant', 'd.chauke@univen.ac.za', 'Enterprise data collection', 7),
  ('Rural Innovation and Enterprise Development', 'Dr. H. Mabunda', 'Postgraduate Committee', 'Committee Member', 'h.mabunda@univen.ac.za', 'Innovation proposals review', 8),

  -- Agri-Food Systems and Nutrition Security
  ('Agri-Food Systems and Nutrition Security', 'Dr. L. Netshandama', 'Permanent Staff', 'Unit Head & Senior Researcher', 'l.netshandama@univen.ac.za', 'Household food security', 1),
  ('Agri-Food Systems and Nutrition Security', 'Dr. G. Mashau', 'Permanent Staff', 'Researcher', 'g.mashau@univen.ac.za', 'Smallholder value chains', 2),
  ('Agri-Food Systems and Nutrition Security', 'Prof. J. Tshikalange', 'Postgraduate Committee', 'Committee Chairperson', 'j.tshikalange@univen.ac.za', 'Postgraduate supervision', 3),
  ('Agri-Food Systems and Nutrition Security', 'Ms. B. Modise', 'Innovation Champion', 'Innovation Champion', 'b.modise@univen.ac.za', 'Post-harvest technologies', 4),
  ('Agri-Food Systems and Nutrition Security', 'Mr. S. Dlamini', 'Graduate Trainee', 'Graduate Trainee', 's.dlamini@univen.ac.za', 'Nutrition survey coordination', 5),
  ('Agri-Food Systems and Nutrition Security', 'Ms. O. Zulu', 'Research Assistant', 'Research Assistant', 'o.zulu@univen.ac.za', 'Field data collection', 6),
  ('Agri-Food Systems and Nutrition Security', 'Mr. P. Mahlangu', 'Intern', 'Intern', 'p.mahlangu@univen.ac.za', 'Laboratory support', 7),

  -- Rural Governance and Community Development
  ('Rural Governance and Community Development', 'Dr. T. Nemakonde', 'Permanent Staff', 'Unit Head & Senior Researcher', 't.nemakonde@univen.ac.za', 'Participatory governance', 1),
  ('Rural Governance and Community Development', 'Ms. R. Adams', 'Permanent Staff', 'Community Development Officer', 'r.adams@univen.ac.za', 'Community mobilisation', 2),
  ('Rural Governance and Community Development', 'Dr. F. Munyai', 'Postgraduate Committee', 'Committee Member', 'f.munyai@univen.ac.za', 'Ethics and methodology review', 3),
  ('Rural Governance and Community Development', 'Mr. K. Molefe', 'Innovation Champion', 'Innovation Champion', 'k.molefe@univen.ac.za', 'Digital civic tools', 4),
  ('Rural Governance and Community Development', 'Ms. N. Sithole', 'Graduate Trainee', 'Graduate Trainee', 'n.sithole@univen.ac.za', 'Municipal partnerships', 5),
  ('Rural Governance and Community Development', 'Mr. L. Ravele', 'Research Assistant', 'Research Assistant', 'l.ravele@univen.ac.za', 'Household surveys', 6),
  ('Rural Governance and Community Development', 'Ms. M. Sibanyoni', 'Intern', 'Intern', 'm.sibanyoni@univen.ac.za', 'Stakeholder liaison support', 7),

  -- Climate Change and Natural Resource Management
  ('Climate Change and Natural Resource Management', 'Prof. S. Mudau', 'Permanent Staff', 'Unit Head & Chief Researcher', 's.mudau@univen.ac.za', 'Climate adaptation', 1),
  ('Climate Change and Natural Resource Management', 'Dr. P. Nkosi', 'Permanent Staff', 'Senior Researcher', 'p.nkosi@univen.ac.za', 'Water resource management', 2),
  ('Climate Change and Natural Resource Management', 'Dr. A. Moyo', 'Postgraduate Committee', 'Committee Member', 'a.moyo@univen.ac.za', 'Environmental research review', 3),
  ('Climate Change and Natural Resource Management', 'Ms. T. Mudzielwana', 'Innovation Champion', 'Innovation Champion', 't.mudzielwana@univen.ac.za', 'Climate-smart agriculture', 4),
  ('Climate Change and Natural Resource Management', 'Mr. V. Nemaorani', 'Graduate Trainee', 'Graduate Trainee', 'v.nemaorani@univen.ac.za', 'Catchment monitoring', 5),
  ('Climate Change and Natural Resource Management', 'Ms. A. Patel', 'Research Assistant', 'Research Assistant', 'a.patel@univen.ac.za', 'Geospatial analysis', 6),
  ('Climate Change and Natural Resource Management', 'Mr. C. Mabasa', 'Intern', 'Intern', 'c.mabasa@univen.ac.za', 'Field station support', 7),

  -- Postgraduate Training and Research Support
  ('Postgraduate Training and Research Support', 'Dr. K. Mulaudzi', 'Permanent Staff', 'Unit Head & Research Coordinator', 'k.mulaudzi@univen.ac.za', 'Research capacity building', 1),
  ('Postgraduate Training and Research Support', 'Prof. J. Tshikalange', 'Postgraduate Committee', 'Committee Chairperson', 'j.tshikalange@univen.ac.za', 'Proposal defence and progress review', 2),
  ('Postgraduate Training and Research Support', 'Dr. H. Mabunda', 'Postgraduate Committee', 'Committee Secretary', 'h.mabunda@univen.ac.za', 'Supervision records', 3),
  ('Postgraduate Training and Research Support', 'Dr. F. Munyai', 'Postgraduate Committee', 'Committee Member', 'f.munyai@univen.ac.za', 'Ethics clearance', 4),
  ('Postgraduate Training and Research Support', 'Mr. T. Maseko', 'Graduate Trainee', 'Graduate Trainee', 't.maseko@univen.ac.za', 'Methods workshop facilitation', 5),
  ('Postgraduate Training and Research Support', 'Ms. K. Nkuna', 'Research Assistant', 'Research Assistant', 'k.nkuna@univen.ac.za', 'Literature and data support', 6),
  ('Postgraduate Training and Research Support', 'Mr. T. Maluleke', 'Intern', 'Intern', 't.maluleke@univen.ac.za', 'Postgraduate office administration', 7),

  -- Knowledge Management and Community Engagement
  ('Knowledge Management and Community Engagement', 'Ms. R. Nesengani', 'Permanent Staff', 'Unit Head & Knowledge Manager', 'r.nesengani@univen.ac.za', 'Knowledge products', 1),
  ('Knowledge Management and Community Engagement', 'Mr. M. Ndou', 'Permanent Staff', 'Communications Officer', 'm.ndou@univen.ac.za', 'Outreach and media', 2),
  ('Knowledge Management and Community Engagement', 'Dr. M. Mahlangu', 'Postgraduate Committee', 'Committee Member', 'm.mahlangu@univen.ac.za', 'Publication review', 3),
  ('Knowledge Management and Community Engagement', 'Ms. L. Baloyi', 'Innovation Champion', 'Innovation Champion', 'l.baloyi@univen.ac.za', 'Community knowledge platforms', 4),
  ('Knowledge Management and Community Engagement', 'Mr. R. Khosa', 'Graduate Trainee', 'Graduate Trainee', 'r.khosa@univen.ac.za', 'Engagement reporting', 5),
  ('Knowledge Management and Community Engagement', 'Ms. Z. Mathebula', 'Research Assistant', 'Research Assistant', 'z.mathebula@univen.ac.za', 'Documentation and archives', 6),
  ('Knowledge Management and Community Engagement', 'Mr. S. Mulovhedzi', 'Intern', 'Intern', 's.mulovhedzi@univen.ac.za', 'Digital content support', 7)
) as s(unit_name, name, category, title, email, focus, position)
join public.units u on u.name = s.unit_name;

-- ============================================================================
-- SEED: stakeholders (external relationships)
-- ============================================================================
insert into public.stakeholders (name, type, relationship, focus, contact_person, contact_email, since, status, unit_id)
select s.name, s.type::stakeholder_type, s.relationship, s.focus, s.contact_person, s.contact_email, s.since, s.status::stakeholder_status, u.id
from (values
  ('Limpopo Department of Agriculture and Rural Development', 'Government', 'Implementation partner', 'Smallholder extension and rural livelihoods', 'Mr. N. Maluleke', 'partnerships@ldard.gov.za', '2019', 'active', 'Agri-Food Systems and Nutrition Security'),
  ('Vhembe District Municipality', 'Government', 'Host district partner', 'Local economic development and service delivery research', 'Ms. P. Tshivhase', 'ided@vhembe.gov.za', '2018', 'active', 'Rural Governance and Community Development'),
  ('Mopani District Municipality', 'Government', 'District partner', 'Community development programmes', 'Mr. J. Rikhotso', 'planning@mopani.gov.za', '2021', 'active', 'Rural Governance and Community Development'),
  ('National Research Foundation (NRF)', 'Funder', 'Research funder', 'Postgraduate bursaries and research grants', 'Grants Office', 'grants@nrf.ac.za', '2016', 'active', 'Postgraduate Training and Research Support'),
  ('Water Research Commission (WRC)', 'Funder', 'Research funder', 'Water security and catchment management projects', 'Programme Manager', 'projects@wrc.org.za', '2020', 'active', 'Climate Change and Natural Resource Management'),
  ('Agricultural Research Council (ARC)', 'Academic', 'Research collaboration', 'Crop trials and climate-smart agriculture', 'Dr. S. Mokoena', 'collaboration@arc.agric.za', '2019', 'active', 'Agri-Food Systems and Nutrition Security'),
  ('Vhembe Traditional Councils Forum', 'Community', 'Community partner', 'Community entry, consent and local knowledge', 'Chief''s Representative', null, '2017', 'active', 'Rural Governance and Community Development'),
  ('Makhado Farmers'' Cooperative', 'Community', 'Community partner', 'Producer training and market access', 'Mr. T. Netshiozwi', null, '2022', 'active', 'Rural Innovation and Enterprise Development'),
  ('Small Enterprise Development Agency (SEDA)', 'Industry', 'Enterprise support partner', 'Incubation and business development support', 'Ms. L. Mokgadi', 'limpopo@seda.org.za', '2021', 'active', 'Rural Innovation and Enterprise Development'),
  ('GIZ South Africa', 'International', 'Development cooperation partner', 'Rural resilience and skills development', 'Programme Coordinator', 'info@giz.de', '2022', 'active', 'Climate Change and Natural Resource Management'),
  ('Food and Agriculture Organization (FAO)', 'International', 'Technical partner', 'Food systems assessment methodology', 'Country Office', null, '2023', 'pending', 'Agri-Food Systems and Nutrition Security'),
  ('University of Pretoria — Future Africa', 'Academic', 'Academic collaboration', 'Joint supervision and transdisciplinary research', 'Prof. D. van Wyk', null, '2023', 'active', 'Postgraduate Training and Research Support'),
  ('Nedbank Foundation', 'Funder', 'Corporate social investment', 'Community outreach and student support', 'CSI Office', null, '2024', 'pending', 'Knowledge Management and Community Engagement'),
  ('SANParks — Kruger National Park', 'Government', 'Research site partner', 'Biodiversity and land use research access', 'Research Permits Office', null, '2020', 'active', 'Climate Change and Natural Resource Management'),
  ('Limpopo Connexion NGO Network', 'NGO', 'Implementation partner', 'Community outreach delivery and volunteer mobilisation', 'Ms. B. Shirinda', null, '2021', 'dormant', 'Knowledge Management and Community Engagement')
) as s(name, type, relationship, focus, contact_person, contact_email, since, status, unit_name)
left join public.units u on u.name = s.unit_name
on conflict (name) do nothing;
