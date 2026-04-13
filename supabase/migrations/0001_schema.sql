-- Migration: 0001_schema.sql
-- Phase 1: Foundation — full DB schema for Speed Monitor

-- 1. speed_results (main telemetry table, 35+ columns matching macOS client payload)
create table public.speed_results (
  id                    bigserial    primary key,
  device_id             text         not null,
  hostname              text,
  timestamp_utc         timestamptz  not null default now(),
  -- WiFi
  ssid                  text,
  bssid                 text,
  band                  text,
  channel               integer,
  rssi_dbm              integer,
  mcs_index             integer,
  spatial_streams       integer,
  snr_db                integer,
  channel_width         text,
  -- Performance
  download_mbps         real,
  upload_mbps           real,
  latency_ms            real,
  jitter_ms             real,
  packet_loss_pct       real,
  -- VPN
  vpn_status            text,
  vpn_name              text,
  -- Network health
  interface_errors_in   bigint,
  interface_errors_out  bigint,
  tcp_retransmits       bigint,
  bssid_changes         integer,
  -- Server connectivity
  server_url            text,
  public_ip             text,
  isp_name              text,
  -- Status
  status                text         default 'success',
  errors                text,
  -- Metadata
  client_version        text,
  os_version            text,
  user_email            text,
  created_at            timestamptz  not null default now()
);

-- Composite btree for device + time queries (most common: "last N tests for device X")
create index idx_speed_results_device_time
  on public.speed_results (device_id, timestamp_utc desc);

-- BRIN for fleet-wide time-range scans (4000x smaller than btree; ideal for append-only data)
create index idx_speed_results_time_brin
  on public.speed_results using brin (timestamp_utc);

alter table public.speed_results enable row level security;

-- 2. device_api_keys (bcrypt-hashed keys for macOS client authentication)
create table public.device_api_keys (
  id           bigserial    primary key,
  device_id    text         not null,
  key_hash     text         not null,   -- bcrypt hash, always 60 chars
  created_at   timestamptz  not null default now(),
  last_used_at timestamptz,
  revoked      boolean      not null default false
);

create index idx_device_api_keys_device on public.device_api_keys (device_id);
alter table public.device_api_keys enable row level security;

-- 3. profiles (Google OAuth users with role assignment)
create table public.profiles (
  user_id    uuid         primary key references auth.users(id) on delete cascade,
  email      text         not null unique,
  role       text         not null default 'employee' check (role in ('admin', 'employee')),
  created_at timestamptz  not null default now()
);

alter table public.profiles enable row level security;

-- 4. device_user_map (links devices to employee email addresses)
create table public.device_user_map (
  id           bigserial    primary key,
  device_id    text         not null,
  user_email   text         not null,
  created_at   timestamptz  not null default now(),
  unique (device_id, user_email)
);

create index idx_device_user_map_email on public.device_user_map (user_email);
alter table public.device_user_map enable row level security;

-- 5. alert_configs (Slack webhook alert rules)
create table public.alert_configs (
  id              bigserial    primary key,
  name            text         not null,
  webhook_url     text         not null,
  alert_type      text         not null,   -- 'threshold' | 'zscore'
  threshold_value real,
  created_at      timestamptz  not null default now()
);

alter table public.alert_configs enable row level security;

-- 6. alert_history (log of triggered alerts)
create table public.alert_history (
  id           bigserial    primary key,
  config_id    bigint       references public.alert_configs(id) on delete set null,
  device_id    text         not null,
  triggered_at timestamptz  not null default now(),
  metric_value real,
  message      text,
  delivered    boolean      not null default false
);

create index idx_alert_history_device on public.alert_history (device_id);
alter table public.alert_history enable row level security;

-- 7. daily_aggregates (pre-computed daily rollups for trends charts)
create table public.daily_aggregates (
  id            bigserial    primary key,
  device_id     text         not null,
  date          date         not null,
  avg_download  real,
  avg_upload    real,
  avg_latency   real,
  median_jitter real,
  test_count    integer      not null default 0,
  unique (device_id, date)
);

create index idx_daily_aggregates_device on public.daily_aggregates (device_id, date desc);
alter table public.daily_aggregates enable row level security;

-- 8. device_baselines (per-device Z-score anomaly detection baselines)
create table public.device_baselines (
  id           bigserial    primary key,
  device_id    text         not null,
  metric       text         not null,   -- 'download_mbps' | 'upload_mbps' | 'latency_ms'
  mean         real         not null,
  std_dev      real         not null,
  sample_count integer      not null default 0,
  updated_at   timestamptz  not null default now(),
  unique (device_id, metric)
);

alter table public.device_baselines enable row level security;

-- 9. remote_commands (IT-issued commands to macOS devices, consumed in Phase 2)
create table public.remote_commands (
  id          bigserial    primary key,
  device_id   text         not null,
  command     text         not null,   -- 'force_update' | 'force_speedtest' | 'restart_service' | 'collect_diagnostics'
  status      text         not null default 'pending',  -- 'pending' | 'completed' | 'failed'
  result      text,
  created_at  timestamptz  not null default now(),
  executed_at timestamptz
);

create index idx_remote_commands_device on public.remote_commands (device_id, status);
alter table public.remote_commands enable row level security;
