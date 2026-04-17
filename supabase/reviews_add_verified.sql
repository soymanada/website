-- supabase/reviews_add_verified.sql
-- Adds the verified flag to reviews, set when submitter had a prior
-- verified_interaction with the provider.

alter table public.reviews
  add column if not exists verified boolean not null default false;
