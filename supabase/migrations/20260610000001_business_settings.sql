-- ============================================================
-- Jobars Events — Business Settings Table
-- Single-row table for editable business contact information.
-- ============================================================

create table if not exists public.business_settings (
  id              integer primary key default 1 check (id = 1),
  business_name   text not null default 'Jobars Events',
  address         text not null default 'Bayugan City, Agusan del Sur, Philippines',
  phone           text not null default '+63 968 666 6783',
  email           text not null default 'jobars.info@gmail.com',
  business_hours  text not null default 'Monday to Saturday, 8:00 AM to 6:00 PM',
  facebook_url    text not null default 'https://www.facebook.com/profile.php?id=100063642080742',
  updated_by      uuid references public.profiles(id),
  updated_at      timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

-- Insert the single row with defaults
insert into public.business_settings (id)
values (1)
on conflict (id) do nothing;

-- Enable RLS
alter table public.business_settings enable row level security;

-- Everyone can read business settings
drop policy if exists "all_read_business_settings" on public.business_settings;
create policy "all_read_business_settings" on public.business_settings
  for select using (true);

-- Only super-admin and admin can update
drop policy if exists "admin_update_business_settings" on public.business_settings;
create policy "admin_update_business_settings" on public.business_settings
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('super-admin', 'admin')
    )
  );

-- updated_at trigger
create trigger trg_business_settings_updated_at
  before update on public.business_settings
  for each row execute function public.set_updated_at();
