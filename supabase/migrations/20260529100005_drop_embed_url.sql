-- ============================================================
-- Jobars Events — Drop embed_url from business_locations
-- ============================================================

alter table public.business_locations
  drop column if exists embed_url;
