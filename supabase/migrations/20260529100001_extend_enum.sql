-- ============================================================
-- Jobars Events — Extend user_role enum (separate transaction)
-- ============================================================

alter type user_role add value if not exists 'super-admin';
alter type user_role add value if not exists 'human-resource';
alter type user_role add value if not exists 'employee';
alter type user_role add value if not exists 'external-client';
