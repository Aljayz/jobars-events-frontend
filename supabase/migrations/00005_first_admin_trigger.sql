-- ============================================================
-- Auto-promote the first registered user to admin
-- ============================================================
-- When a profile is inserted and no admin exists yet,
-- that user becomes an admin automatically.

create or replace function public.handle_first_admin()
returns trigger as $$
begin
  if not exists (select 1 from public.profiles where role = 'admin') then
    new.role = 'admin';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_profiles_first_admin on public.profiles;
create trigger trg_profiles_first_admin
  before insert on public.profiles
  for each row execute function public.handle_first_admin();
