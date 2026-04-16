-- Migration 0006: Seed a default Z-score anomaly alert config
-- This allows ALERT-02 (zscore anomaly alerts) to be exercised.
-- The config fires when any device's download_mbps deviates more than 2 std devs from baseline.
-- This is a fleet-wide config (scope = 'fleet', scope_device_id = null).
-- Only inserted if no zscore config already exists (idempotent).

INSERT INTO public.alert_configs (
  name,
  webhook_url,
  alert_type,
  metric,
  threshold_value,
  scope,
  scope_device_id,
  enabled
)
SELECT
  'Download anomaly (Z-score)',
  NULL,
  'zscore',
  'download_mbps',
  2.0,
  'fleet',
  NULL,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.alert_configs WHERE alert_type = 'zscore' AND metric = 'download_mbps'
);
