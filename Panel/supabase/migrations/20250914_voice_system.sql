-- Voice system schema for Avukat Bilgi Sistemi
create table if not exists voice_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) unique,
  enabled boolean default true,
  language text default 'tr-TR',
  voice_shortcuts jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists voice_command_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  command text not null,
  intent text,
  parameters jsonb,
  success boolean,
  response text,
  executed_at timestamptz default now()
);

alter table voice_settings enable row level security;
alter table voice_command_history enable row level security;

create policy "own settings" on voice_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own history read" on voice_command_history
  for select using (auth.uid() = user_id);
