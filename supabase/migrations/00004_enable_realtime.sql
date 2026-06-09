-- ============================================================
-- Enable Realtime for the messages table
-- ============================================================
-- Ensure the messages table is in the Supabase Realtime publication.
-- This lets the chat subscribe to INSERT events in real-time.

alter publication supabase_realtime add table public.messages;
-- Also add chat_participants if you want to listen for participant changes
alter publication supabase_realtime add table public.chat_participants;
