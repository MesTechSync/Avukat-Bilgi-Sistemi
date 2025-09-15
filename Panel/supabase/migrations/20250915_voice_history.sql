-- Voice history table aligned with frontend types
create table if not exists voice_history (
  id bigint primary key generated always as identity,
  transcript text not null,
  category text not null,
  action text not null,
  parameters jsonb,
  created_at timestamptz default now()
);

alter table voice_history enable row level security;

-- Simple read policy; tighten as needed per project auth later
create policy "public read voice history" on voice_history
  for select using (true);

-- Insert policy requires authenticated users; adjust to your auth model
create policy "authenticated insert voice history" on voice_history
  for insert to authenticated using (true) with check (true);
