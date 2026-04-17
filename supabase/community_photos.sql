-- Community photos submitted by users for gallery review
create table if not exists public.community_photos (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users on delete set null,
  storage_path   text not null,
  public_url     text not null,
  caption        text not null,
  city           text,
  submitter_name text,
  status         text not null default 'pending'
                   check (status in ('pending', 'approved', 'rejected')),
  submitted_at   timestamp with time zone default now(),
  reviewed_at    timestamp with time zone
);

alter table public.community_photos enable row level security;

-- Anyone (including anonymous) can submit
create policy "Anyone can submit a photo"
  on public.community_photos for insert
  with check (true);

-- Approved photos are publicly readable
create policy "Public reads approved photos"
  on public.community_photos for select
  using (status = 'approved');

-- Admins can read and update all photos
create policy "Admins manage photos"
  on public.community_photos for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
