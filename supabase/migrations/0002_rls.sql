-- Migration: 0002_rls.sql
-- Phase 1: Foundation — RLS policies for all tables

-- Helper: get calling user's role from profiles table (security definer so it runs as function owner)
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
as $$
  select role from public.profiles where user_id = auth.uid()
$$;

-- speed_results: admins read all; employees read only rows where device_id is in their device_user_map
create policy "employees_read_own_speed_results" on public.speed_results
  for select to authenticated
  using (
    public.get_my_role() = 'admin'
    or device_id in (
      select device_id from public.device_user_map
      where user_email = (select email from public.profiles where user_id = auth.uid())
    )
  );

-- profiles: users read own row; admins read all
create policy "users_read_own_profile" on public.profiles
  for select to authenticated
  using (user_id = auth.uid() or public.get_my_role() = 'admin');

-- profiles insert: user can only insert their own row (callback route uses service_role for upsert anyway)
create policy "users_insert_own_profile" on public.profiles
  for insert to authenticated
  with check (user_id = auth.uid());

-- device_api_keys: no policies for authenticated users — only supabaseAdmin (service_role) accesses this table
-- service_role bypasses RLS automatically; no policy needed

-- alert_configs: admins only (full CRUD)
create policy "admins_manage_alert_configs" on public.alert_configs
  for all to authenticated
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- alert_history: admins read only
create policy "admins_read_alert_history" on public.alert_history
  for select to authenticated
  using (public.get_my_role() = 'admin');

-- daily_aggregates: same as speed_results (employees see own devices; admins see all)
create policy "employees_read_own_daily_aggregates" on public.daily_aggregates
  for select to authenticated
  using (
    public.get_my_role() = 'admin'
    or device_id in (
      select device_id from public.device_user_map
      where user_email = (select email from public.profiles where user_id = auth.uid())
    )
  );

-- device_baselines: same as speed_results
create policy "employees_read_own_device_baselines" on public.device_baselines
  for select to authenticated
  using (
    public.get_my_role() = 'admin'
    or device_id in (
      select device_id from public.device_user_map
      where user_email = (select email from public.profiles where user_id = auth.uid())
    )
  );

-- device_user_map: employees read own rows; admins read all
create policy "employees_read_own_device_user_map" on public.device_user_map
  for select to authenticated
  using (
    public.get_my_role() = 'admin'
    or user_email = (select email from public.profiles where user_id = auth.uid())
  );

-- remote_commands: only service_role writes; no RLS needed for reads since device auth is via API key
-- (remote_commands is read via GET /api/commands/:device_id which uses supabaseAdmin in Phase 2)
