import { supabaseAdmin } from '@/lib/supabase/admin'
import AlertsPageClient from './AlertsPageClient'

export const dynamic = 'force-dynamic'

interface AlertConfig {
  id: number
  name: string
  metric: string | null
  threshold_value: number | null
  scope: string
  scope_device_id: string | null
  enabled: boolean
  created_at: string
}

interface AlertHistoryRow {
  id: number
  device_id: string
  triggered_at: string
  metric_value: number | null
  message: string | null
  config_name: string | null
  threshold_value: number | null
  metric: string | null
}

async function getAlertConfigs(): Promise<AlertConfig[]> {
  const { data } = await supabaseAdmin
    .from('alert_configs')
    .select('id, name, metric, threshold_value, scope, scope_device_id, enabled, created_at')
    .order('created_at', { ascending: false })
  return (data ?? []) as AlertConfig[]
}

async function getAlertHistory(): Promise<AlertHistoryRow[]> {
  // Fetch alert_history rows joined with alert_configs for name + threshold
  const { data: historyRows } = await supabaseAdmin
    .from('alert_history')
    .select('id, device_id, triggered_at, metric_value, message, config_id')
    .order('triggered_at', { ascending: false })
    .limit(50)

  if (!historyRows || historyRows.length === 0) return []

  // Collect unique config_ids
  const configIds = [
    ...new Set(historyRows.map((r) => r.config_id).filter(Boolean)),
  ] as number[]

  // Fetch config details for name, threshold, metric
  const { data: configs } = configIds.length > 0
    ? await supabaseAdmin
        .from('alert_configs')
        .select('id, name, threshold_value, metric')
        .in('id', configIds)
    : { data: [] }

  const configMap = new Map(
    (configs ?? []).map((c) => [c.id, c])
  )

  return historyRows.map((row) => {
    const config = row.config_id ? configMap.get(row.config_id) : null
    return {
      id: row.id as number,
      device_id: row.device_id as string,
      triggered_at: row.triggered_at as string,
      metric_value: (row.metric_value as number | null) ?? null,
      message: (row.message as string | null) ?? null,
      config_name: config?.name ?? null,
      threshold_value: config?.threshold_value ?? null,
      metric: config?.metric ?? null,
    }
  })
}

export default async function AlertsPage() {
  const [rules, history] = await Promise.all([
    getAlertConfigs(),
    getAlertHistory(),
  ])

  return <AlertsPageClient initialRules={rules} initialHistory={history} />
}
