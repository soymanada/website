-- supabase/verified_interactions.sql
-- Tracks when a real interaction has occurred between a user (migrant)
-- and a provider, unlocking the ability to leave a review.
-- Trigger: provider replies to a message via replyMessage()

create table if not exists public.verified_interactions (
  id          uuid        default gen_random_uuid() primary key,
  provider_id text        not null,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  source      text        not null default 'message_reply'
                          check (source in ('message_reply', 'booking_completed', 'manual')),
  created_at  timestamptz default now(),
  unique(provider_id, user_id)
);

alter table public.verified_interactions enable row level security;

-- Users can read their own interactions (to check if they can review)
create policy "users read own interactions"
  on public.verified_interactions for select
  using (auth.uid() = user_id);

-- Service role / providers can insert (via trusted functions)
create policy "service role insert"
  on public.verified_interactions for insert
  with check (true);

-- Admins manage all
create policy "admins manage all"
  on public.verified_interactions for all
  using (
    exists (
      select 1 from public.providers
      where user_id = auth.uid()
        and is_admin = true
    )
  );
