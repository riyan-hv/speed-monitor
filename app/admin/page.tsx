import { supabaseAdmin } from '@/lib/supabase/admin'
import { computeHealthStatus, HealthStatus } from '@/lib/admin/health'
import StatCard from '@/components/admin/StatCard'
import DeviceHeatmap from '@/components/admin/DeviceHeatmap'

export const dynamic = 'force-dynamic'

interface DeviceCell {
  device_id: string
  hostname: string | null
  health: HealthStatus
  last_download: number | null
}

async function getFleetStats() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabaseAdmin
    .from('speed_results')
    .select('device_id, download_mbps, upload_mbps, latency_ms')
    .gte('timestamp_utc', since24h)

  const rows = data ?? []
  const deviceIds = new Set(rows.map((r) => r.device_id))
  const activeDeviceCount = deviceIds.size

  const downloads = rows.map((r) => r.download_mbps).filter((v): v is number => v != null)
  const uploads   = rows.map((r) => r.upload_mbps).filter((v): v is number => v != null)
  const latencies = rows.map((r) => r.latency_ms).filter((v): v is number => v != null)

  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100 : 0

  return {
    activeDeviceCount,
    avgDownload: avg(downloads),
    avgUpload: avg(uploads),
    avgLatency: avg(latencies),
  }
}

async function getDevicesForHeatmap(): Promise<DeviceCell[]> {
  const { data: rawResults } = await supabaseAdmin
    .from('speed_results')
    .select('device_id, hostname, download_mbps, timestamp_utc')
    .order('timestamp_utc', { ascending: false })
    .limit(2000)

  const seen = new Set<string>()
  const lastPerDevice: Array<{
    device_id: string
    hostname: string | null
    download_mbps: number | null
    timestamp_utc: string | null
  }> = []

  for (const row of rawResults ?? []) {
    if (!seen.has(row.device_id)) {
      seen.add(row.device_id)
      lastPerDevice.push(row)
    }
  }

  const { data: baselines } = await supabaseAdmin
    .from('device_baselines')
    .select('device_id, mean, std_dev')
    .eq('metric', 'download_mbps')

  const baselineMap = new Map((baselines ?? []).map((b) => [b.device_id, b]))

  return lastPerDevice.map((r) => {
    const baseline = baselineMap.get(r.device_id)
    const health = computeHealthStatus(
      r.download_mbps,
      baseline?.mean ?? null,
      baseline?.std_dev ?? null,
      r.timestamp_utc,
    )
    return { device_id: r.device_id, hostname: r.hostname, health, last_download: r.download_mbps }
  })
}

export default async function AdminPage() {
  const [stats, devices] = await Promise.all([getFleetStats(), getDevicesForHeatmap()])

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Fleet Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Network performance across all devices · last 24 hours</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Active Devices"
          value={stats.activeDeviceCount}
          sublabel="last 24 hours"
          accent="bg-indigo-500"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          }
        />
        <StatCard
          label="Avg Download"
          value={stats.avgDownload}
          unit="Mbps"
          sublabel="last 24 hours"
          accent="bg-emerald-500"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          }
        />
        <StatCard
          label="Avg Upload"
          value={stats.avgUpload}
          unit="Mbps"
          sublabel="last 24 hours"
          accent="bg-sky-500"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          }
        />
        <StatCard
          label="Avg Latency"
          value={stats.avgLatency}
          unit="ms"
          sublabel="last 24 hours"
          accent="bg-amber-500"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Device health heatmap */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Device Health</h2>
        <p className="text-xs text-gray-400 mb-4">Last result per device</p>
        <DeviceHeatmap devices={devices} />
      </div>
    </div>
  )
}
