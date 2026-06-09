# Supabase Dashboard Setup Guide

## 1. Run Notifications Migration

1. Go to https://supabase.com/dashboard/project/pvkkaecnlphgsyefvxlm
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Paste the entire contents of `supabase/migrations/20260529044415_notifications.sql`:

```sql
create table if not exists public.notifications (
  id            uuid         primary key default gen_random_uuid(),
  profile_id    uuid         not null references public.profiles(id) on delete cascade,
  title         text         not null,
  message       text,
  type          text         not null default 'general',
  link          text,
  is_read       boolean      not null default false,
  created_at    timestamptz  not null default now()
);

create index if not exists idx_notifications_profile on public.notifications(profile_id);
create index if not exists idx_notifications_unread on public.notifications(profile_id, is_read);

alter table public.notifications enable row level security;

drop policy if exists "read_own_notifications" on public.notifications;
create policy "read_own_notifications" on public.notifications
  for select using (profile_id = auth.uid());

drop policy if exists "update_own_notifications" on public.notifications;
create policy "update_own_notifications" on public.notifications
  for update using (profile_id = auth.uid());

drop policy if exists "insert_notifications" on public.notifications;
create policy "insert_notifications" on public.notifications
  for insert with check (true);
```

5. Click **Run** — you should see "Success. No rows returned"

## 2. Create Storage Bucket

1. In the same Supabase Dashboard, click **Storage** in the left sidebar
2. Click **New Bucket**
3. Fill in:
   - **Name:** `approval_files`
   - **Public bucket:** ✅ ON
   - **File size limit:** `10485760` (10MB)
   - **Allowed MIME types:** click "Add MIME type" for each:
     - `image/png`
     - `image/jpeg`
     - `image/webp`
     - `application/pdf`
     - `video/mp4`
     - `video/webm`
4. Click **Create bucket**

## 3. Verify Everything Works

After both steps, restart the dev server:

```bash
npm run dev -- --webpack
```

Then test:
- Visit **Notifications page** (`/dashboard/notifications`) — should load without errors
- Visit **Proof Uploads** (`/dashboard/admin/uploads`) — should let you upload files
