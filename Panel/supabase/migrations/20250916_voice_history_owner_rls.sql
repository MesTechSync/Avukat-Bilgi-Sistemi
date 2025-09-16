-- Strengthen RLS for voice_history with owner-based access
-- Assumes auth.uid() is available; add owner column if missing
alter table voice_history add column if not exists owner uuid;

-- Backfill existing rows to current user where possible (no-op outside SQL runtime with auth context)
-- update voice_history set owner = auth.uid() where owner is null;

-- Ensure RLS enabled (idempotent if already enabled)
alter table voice_history enable row level security;

-- Drop permissive select policy if present
drop policy if exists "public read voice history" on voice_history;

-- Enforce owner-only access
create policy "owner can read" on voice_history
  for select using (owner = auth.uid());

create policy "owner can insert" on voice_history
  for insert to authenticated with check (owner = auth.uid());

create policy "owner can update" on voice_history
  for update using (owner = auth.uid()) with check (owner = auth.uid());

create policy "owner can delete" on voice_history
  for delete using (owner = auth.uid());
