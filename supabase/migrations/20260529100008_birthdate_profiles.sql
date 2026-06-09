-- ============================================================
-- Jobars Events — Add birthdate to profiles, update trigger
-- ============================================================

-- Add birthdate column
alter table public.profiles
  add column if not exists birthdate date;

-- Update trigger to store phone, birthdate, and use consistent role default
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data ->> 'role', 'external-client');

  insert into public.profiles (id, email, full_name, phone, birthdate, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'phone',
    nullif(new.raw_user_meta_data ->> 'birthdate', '')::date,
    v_role::public.user_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Backfill existing profiles that are missing phone/birthdate
update public.profiles p
set
  phone  = coalesce(p.phone, (select au.raw_user_meta_data ->> 'phone' from auth.users au where au.id = p.id)),
  birthdate = coalesce(p.birthdate, nullif((select au.raw_user_meta_data ->> 'birthdate' from auth.users au where au.id = p.id), '')::date)
where p.phone is null or p.birthdate is null;
