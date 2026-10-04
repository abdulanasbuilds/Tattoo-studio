create extension if not exists pgcrypto;

create table if not exists public.studios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  location text,
  timezone text not null default 'UTC',
  email text,
  phone text,
  instagram text,
  tiktok text,
  theme text not null default 'v1' check (theme in ('v1','v2','v3','v4','v5')),
  booking_mode text not null default 'request' check (booking_mode in ('request','external')),
  booking_url text,
  deposit_url text,
  content jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.studio_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  studio_id uuid not null references public.studios(id) on delete cascade,
  role text not null default 'staff' check (role in ('owner','staff')),
  created_at timestamptz not null default now()
);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  preferred_artist text,
  idea text not null,
  preferred_dates text,
  reference_links text,
  status text not null default 'pending' check (status in ('pending','approved','declined','archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists booking_requests_studio_status_idx
  on public.booking_requests(studio_id, status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists studios_set_updated_at on public.studios;
create trigger studios_set_updated_at
before update on public.studios
for each row execute function public.set_updated_at();

drop trigger if exists booking_requests_set_updated_at on public.booking_requests;
create trigger booking_requests_set_updated_at
before update on public.booking_requests
for each row execute function public.set_updated_at();

alter table public.studios enable row level security;
alter table public.studio_users enable row level security;
alter table public.booking_requests enable row level security;

revoke all on public.studios from anon, authenticated;
revoke all on public.studio_users from anon, authenticated;
revoke all on public.booking_requests from anon, authenticated;

grant select on public.studios to anon, authenticated;
grant update on public.studios to authenticated;

grant select on public.studio_users to authenticated;

grant insert on public.booking_requests to anon, authenticated;
grant select, update on public.booking_requests to authenticated;

drop policy if exists "Public can view active studios" on public.studios;
create policy "Public can view active studios"
on public.studios
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Assigned staff can update studio" on public.studios;
create policy "Assigned staff can update studio"
on public.studios
for update
to authenticated
using (
  exists (
    select 1
    from public.studio_users su
    where su.user_id = auth.uid()
      and su.studio_id = studios.id
  )
)
with check (
  exists (
    select 1
    from public.studio_users su
    where su.user_id = auth.uid()
      and su.studio_id = studios.id
  )
);

drop policy if exists "Users can view their studio membership" on public.studio_users;
create policy "Users can view their studio membership"
on public.studio_users
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Anyone can submit a booking request" on public.booking_requests;
create policy "Anyone can submit a booking request"
on public.booking_requests
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.studios s
    where s.id = booking_requests.studio_id
      and s.is_active = true
  )
);

drop policy if exists "Assigned staff can view bookings" on public.booking_requests;
create policy "Assigned staff can view bookings"
on public.booking_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.studio_users su
    where su.user_id = auth.uid()
      and su.studio_id = booking_requests.studio_id
  )
);

drop policy if exists "Assigned staff can update bookings" on public.booking_requests;
create policy "Assigned staff can update bookings"
on public.booking_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.studio_users su
    where su.user_id = auth.uid()
      and su.studio_id = booking_requests.studio_id
  )
)
with check (
  exists (
    select 1
    from public.studio_users su
    where su.user_id = auth.uid()
      and su.studio_id = booking_requests.studio_id
  )
);

insert into public.studios (
  slug,
  name,
  tagline,
  location,
  timezone,
  email,
  phone,
  theme,
  booking_mode,
  content
)
values (
  'demo',
  'YOUR STUDIO',
  'Custom tattoos, considered detail, and a clean booking experience.',
  'Your city',
  'UTC',
  'hello@example.com',
  '',
  'v1',
  'request',
  jsonb_build_object(
    'about', 'A ready-to-configure tattoo studio website and booking system.',
    'services', jsonb_build_array(
      jsonb_build_object('title','Custom tattoo','detail','Custom work built around your idea, placement, and style.'),
      jsonb_build_object('title','Fine line','detail','Detailed fine-line work and delicate compositions.')
    ),
    'artists', jsonb_build_array(),
    'portfolio', jsonb_build_array()
  )
)
on conflict (slug) do nothing;

/*
ONE-TIME STAFF SETUP

1. Create the staff email/password in Supabase Authentication.
2. Replace YOUR_EMAIL below and run:

insert into public.studio_users (user_id, studio_id, role)
select u.id, s.id, 'owner'
from auth.users u
cross join public.studios s
where u.email = 'YOUR_EMAIL@example.com'
  and s.slug = 'demo'
on conflict (user_id) do update
set studio_id = excluded.studio_id,
    role = excluded.role;

The browser only uses the Supabase publishable key.
Never put a service-role/secret key in app/config.js.
*/