-- Migration: 0004_ingest_helpers
-- Purpose: Atomic helper functions for daily aggregate updates and device baseline updates.
-- Both functions are called by POST /api/ingest/result after inserting a speed_results row.

-- ---------------------------------------------------------------------------
-- upsert_daily_aggregate
-- ---------------------------------------------------------------------------
-- Updates (or inserts) the running daily average for a device on a given date.
-- On conflict: uses incremental running-average formula so no history re-query needed.
-- On insert:   seeds all avg fields with the first sample value and test_count = 1.
-- ---------------------------------------------------------------------------
create or replace function public.upsert_daily_aggregate(
  p_device_id  text,
  p_date       date,
  p_download   real,
  p_upload     real,
  p_latency    real,
  p_jitter     real
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.daily_aggregates (
    device_id,
    date,
    avg_download,
    avg_upload,
    avg_latency,
    median_jitter,
    test_count
  ) values (
    p_device_id,
    p_date,
    p_download,
    p_upload,
    p_latency,
    p_jitter,
    1
  )
  on conflict (device_id, date) do update
    set
      avg_download   = (daily_aggregates.avg_download * daily_aggregates.test_count + p_download)
                       / (daily_aggregates.test_count + 1),
      avg_upload     = (daily_aggregates.avg_upload * daily_aggregates.test_count + p_upload)
                       / (daily_aggregates.test_count + 1),
      avg_latency    = (daily_aggregates.avg_latency * daily_aggregates.test_count + p_latency)
                       / (daily_aggregates.test_count + 1),
      median_jitter  = p_jitter,  -- last-write approximation (no sort needed)
      test_count     = daily_aggregates.test_count + 1;
end;
$$;

-- ---------------------------------------------------------------------------
-- upsert_device_baseline
-- ---------------------------------------------------------------------------
-- Updates (or inserts) per-device, per-metric statistics using Welford's
-- online algorithm — O(1), single-pass, numerically stable.
--
-- Welford's update (new sample p_value, previous state n/mean/variance):
--   new_count    = n + 1
--   delta        = p_value - mean
--   new_mean     = mean + delta / new_count
--   delta2       = p_value - new_mean
--   new_variance = (old_variance * max(n - 1, 0) + delta * delta2) / new_count
--   new_std_dev  = sqrt(new_variance)  -- 0 if count < 2
--
-- Tracked metrics: 'download_mbps', 'upload_mbps', 'latency_ms'
-- ---------------------------------------------------------------------------
create or replace function public.upsert_device_baseline(
  p_device_id  text,
  p_metric     text,
  p_value      real
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count        integer;
  v_mean         real;
  v_variance     real;
  v_new_count    integer;
  v_delta        real;
  v_new_mean     real;
  v_delta2       real;
  v_new_variance real;
  v_new_std_dev  real;
begin
  -- Guard: only track expected metric names
  if p_metric not in ('download_mbps', 'upload_mbps', 'latency_ms') then
    return;
  end if;

  select sample_count, mean, std_dev
    into v_count, v_mean, v_variance
    from public.device_baselines
   where device_id = p_device_id
     and metric    = p_metric;

  if not found then
    -- First sample: seed with value, std_dev = 0
    insert into public.device_baselines (device_id, metric, mean, std_dev, sample_count)
    values (p_device_id, p_metric, p_value, 0, 1);
  else
    -- Welford's online update
    v_new_count    := v_count + 1;
    v_delta        := p_value - v_mean;
    v_new_mean     := v_mean + v_delta / v_new_count;
    v_delta2       := p_value - v_new_mean;
    -- v_variance currently stores std_dev; convert to variance for update
    -- stored_variance = std_dev^2 (approximation — std_dev was sqrt of variance)
    v_new_variance := ((v_variance * v_variance) * greatest(v_count - 1, 0) + v_delta * v_delta2)
                      / v_new_count;
    v_new_std_dev  := case when v_new_count >= 2 then sqrt(greatest(v_new_variance, 0)) else 0 end;

    update public.device_baselines
       set mean         = v_new_mean,
           std_dev      = v_new_std_dev,
           sample_count = v_new_count,
           updated_at   = now()
     where device_id = p_device_id
       and metric    = p_metric;
  end if;
end;
$$;
