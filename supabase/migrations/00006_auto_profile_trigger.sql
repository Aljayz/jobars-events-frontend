-- ============================================================
-- Auto-create profile when a new auth user signs up
-- ============================================================
-- This trigger runs inside auth.users so it bypasses RLS.
-- It creates a public.profiles row automatically.

create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data ->> 'role', 'external-client');

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    v_role::public.user_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Also create profile for existing auth.users who are missing one
insert into public.profiles (id, email, full_name, role)
select
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data ->> 'full_name', split_part(au.email, '@', 1)),
  coalesce((au.raw_user_meta_data ->> 'role')::public.user_role, 'client')
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null
on conflict (id) do nothing;
