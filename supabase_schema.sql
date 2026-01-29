-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Create Memories Table
create table memories (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null, -- Stores the email or unique ID from MojoAuth
  title text,
  date date not null,
  image_url text, -- Stores Cloudinary URL
  note text,
  favorite boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Enable RLS (Row Level Security)
alter table memories enable row level security;

-- 3. Create Policy (Allow all for now since custom auth logic is client-side for this MVP)
-- ideally we sync MojoAuth users to Supabase Auth, but for this simpler architecture:
create policy "Allow all operations for authenticated users" 
on memories for all 
using (true) 
with check (true);
-- Note: Ideally we filter by user_id, but the client must send it.
