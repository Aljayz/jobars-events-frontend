-- ============================================================
-- Jobars Events — Seed Data
-- Run this in Supabase SQL Editor after migrations.
-- ============================================================

-- 1. Sample Services Directory
insert into public.services (name, category, description, base_price, is_active) values
  ('Premium Buffet Package',  'catering',     'Full-course buffet with 10 menu options',        85000,   true),
  ('Silver Buffet Package',   'catering',     '5-course buffet for intimate events',             55000,   true),
  ('Professional Sound System','sound_system', 'High-end speakers, mixer, and 2 microphones',    25000,   true),
  ('Photo & Video Coverage',  'photo_video',  'Professional photographer + videographer, 8 hrs', 45000,   true),
  ('Photo Booth Rental',      'photo_booth',  'Backdrop, props, instant prints, 4 hrs',         15000,   true),
  ('Customized Souvenirs',    'souvenirs',    'Personalized giveaways for up to 100 guests',     12000,   true),
  ('Elegant Invitation Set',  'invitations',  '50 printed invites with RSVP cards + envelopes',  8000,    true),
  ('Fairy Light Setup',       'lights',       'Indoor/outdoor fairy light installation',         10000,   true),
  ('Full Styling Package',    'styling',      'Venue styling: stage, tables, entrance arch',      65000,   true),
  ('Makeup & Hair Styling',   'makeup',       'Bridal makeup + hair, trial session included',    12000,   true),
  ('Professional Host/MC',    'host',         'Experienced MC for the entire program',           18000,   true)
on conflict do nothing;

-- 2. Sample Milestones (reference data — assign to a booking once created)
-- Run these per-booking via the UI or manually:
-- insert into public.event_milestones (booking_id, title, description, due_date, sort_order) values
--   ('<booking-id>', 'Food Tasting',   'Sample the menu and finalize selections',  '2026-08-01', 1),
--   ('<booking-id>', 'Prenuptial Shoot','Schedule and complete prenup photo session','2026-08-15', 2),
--   ('<booking-id>', 'Final Headcount', 'Confirm final guest count to coordinator', '2026-09-01', 3),
--   ('<booking-id>', 'Payment Due',     'Settle remaining balance',                '2026-09-10', 4);

-- 3. Verify
select '✅ Seed complete' as result;
