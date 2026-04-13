-- Migration: 0003_pg_cron.sql
-- Phase 1: Foundation — 90-day retention policy via pg_cron
--
-- PREREQUISITE: pg_cron extension must be enabled BEFORE running this SQL.
-- Steps:
--   1. Supabase Dashboard → Database → Extensions
--   2. Search "pg_cron" → Enable
--   3. Then run this SQL file in SQL Editor

select cron.schedule(
  'purge-speed-results-90d',      -- job name (immutable; cannot be changed after creation)
  '0 3 * * *',                    -- daily at 3:00am UTC
  $$
    delete from public.speed_results
    where timestamp_utc < now() - interval '90 days';
  $$
);

-- Verify the job was registered
-- select * from cron.job where jobname = 'purge-speed-results-90d';
