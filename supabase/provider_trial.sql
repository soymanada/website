-- supabase/provider_trial.sql
-- Adds free trial tracking to the providers table.
-- Early-bird period: launch (2026-04-19) → 2026-07-19 = 3 months Gold free
-- After early-bird: 1 month Gold free

alter table public.providers
  add column if not exists trial_activated_at timestamptz default null,
  add column if not exists trial_ends_at      timestamptz default null;

-- Auto-downgrade expired trials (run this in Supabase → Extensions → pg_cron)
-- select cron.schedule(
--   'downgrade-expired-trials',
--   '0 3 * * *',
--   $$
--     update public.providers
--     set tier = 'bronze'
--     where trial_ends_at is not null
--       and trial_ends_at < now()
--       and tier = 'gold'
--       and trial_activated_at is not null;
--   $$
-- );
