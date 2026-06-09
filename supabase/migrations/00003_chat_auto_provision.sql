-- ============================================================
-- Jobars Events — Auto-Provision Chat Rooms on Booking Approval
-- ============================================================

-- Automatically create a chat room and add participants when
-- an event booking status changes to 'approved'.

create or replace function public.provision_chat_room()
returns trigger as $$
declare
  v_chat_room_id uuid;
  v_staff record;
begin
  -- Only trigger when status changes to 'approved'
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    -- Create the chat room
    insert into public.chat_rooms (booking_id, name)
    values (
      new.id,
      concat('Event Chat — Booking #', substr(new.id::text, 1, 8))
    )
    returning id into v_chat_room_id;

    -- Add the client as a participant
    insert into public.chat_participants (chat_room_id, profile_id)
    values (v_chat_room_id, new.client_id);

    -- Add all admins and managers as participants
    insert into public.chat_participants (chat_room_id, profile_id)
    select v_chat_room_id, id
    from public.profiles
    where role in ('admin', 'manager')
      and id != new.client_id
      and not exists (
        select 1 from public.chat_participants
        where chat_room_id = v_chat_room_id and profile_id = profiles.id
      );

    -- Add all assigned staff for this booking's services
    for v_staff in
      select distinct sa.staff_id
      from public.staff_assignments sa
      join public.booking_services bs on bs.id = sa.booking_service_id
      where bs.booking_id = new.id
        and not exists (
          select 1 from public.chat_participants
          where chat_room_id = v_chat_room_id and profile_id = sa.staff_id
        )
    loop
      insert into public.chat_participants (chat_room_id, profile_id)
      values (v_chat_room_id, v_staff.staff_id);
    end loop;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_events_bookings_provision_chat
  after update of status on public.events_bookings
  for each row execute function public.provision_chat_room();

-- Also fire on insert in case a booking is created with status 'approved'
create trigger trg_events_bookings_provision_chat_insert
  after insert on public.events_bookings
  for each row when (new.status = 'approved')
  execute function public.provision_chat_room();
