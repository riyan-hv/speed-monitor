import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import TrendsChart from '@/components/admin/TrendsChart'
import TimeOfDayHeatmap from '@/components/admin/TimeOfDayHeatmap'
import WifiBandChart from '@/components/admin/WifiBandChart'
import VpnStatsSection from '@/components/admin/VpnStatsSection'

export const dynamic = 'force-dynamic'

const VALID_DAYS = [7, 30, 60, 90]

interface TrendsSearchParams {
  days?: string
}

async function getTrendsData(days: number) {
  const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const { data } = await supabaseAdmin
    .from('daily_aggregates')
    .select('date, avg_download, avg_upload, test_count')
    .gte('date', sinceDate)
    .order('date', { ascending: true })

  const rows = data ?? []

  const byDate = new Map<
    string,
    { sumDownload: number; sumUpload: number; totalTests: number }
  >()
  for (const row of rows) {
    const key = row.date as string
    const entry = byDate.get(key) ?? { sumDownload: 0, sumUpload: 0, totalTests: 0 }
    const count = (row.test_count as number) ?? 0
    entry.sumDownload += ((row.avg_download as number) ?? 0) * count
    entry.sumUpload += ((row.avg_upload as number) ?? 0) * count
    entry.totalTests += count
    byDate.set(key, entry)
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { sumDownload, sumUpload, totalTests }]) => ({
      date,
      avg_download: totalTests > 0 ? Math.round((sumDownload / totalTests) * 100) / 100 : 0,
      avg_upload: totalTests > 0 ? Math.round((sumUpload / totalTests) * 100) / 100 : 0,
    }))
}

async function getTimeOfDayData(days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabaseAdmin
    .from('speed_results')
    .select('timestamp_utc, download_mbps')
    .gte('timestamp_utc', since)
    .not('download_mbps', 'is', null)

  const rows = data ?? []

  const byHour = new Map<number, { sum: number; count: number }>()
  for (const row of rows) {
    if (row.timestamp_utc == null || row.download_mbps == null) continue
    const hour = new Date(row.timestamp_utc).getUTCHours()
    const entry = byHour.get(hour) ?? { sum: 0, count: 0 }
    entry.sum += row.download_mbps
    entry.count += 1
    byHour.set(hour, entry)
  }

  return Array.from({ length: 24 }, (_, hour) => {
    const entry = byHour.get(hour)
    return {
      hour,
      avg_download:
        entry && entry.count > 0
          ? Math.round((entry.sum / entry.count) * 100) / 100
          : null,
    }
  })
}

async function getWifiStats(days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  // Get latest result per device for band/ssid — fetch recent 2000, dedup in JS
  const { data } = await supabaseAdmin
    .from('speed_results')
    .select('device_id, band, ssid')
    .gte('timestamp_utc', since)
    .order('timestamp_utc', { ascending: false })
    .limit(2000)

  const rows = data ?? []

  // Dedup to latest per device
  const seen = new Set<string>()
  const latest: Array<{ band: string | null; ssid: string | null }> = []
  for (const row of rows) {
    if (!seen.has(row.device_id)) {
      seen.add(row.device_id)
      latest.push({ band: row.band, ssid: row.ssid })
    }
  }

  const bandDistribution = { '2.4GHz': 0, '5GHz': 0, '6GHz': 0, unknown: 0 }
  const ssidCounts = new Map<string, number>()

  for (const { band, ssid } of latest) {
    if (band === '2.4GHz' || band === '2.4 GHz') bandDistribution['2.4GHz']++
    else if (band === '5GHz' || band === '5 GHz') bandDistribution['5GHz']++
    else if (band === '6GHz' || band === '6 GHz') bandDistribution['6GHz']++
    else bandDistribution.unknown++

    if (ssid) {
      ssidCounts.set(ssid, (ssidCounts.get(ssid) ?? 0) + 1)
    }
  }

  const topSsids = Array.from(ssidCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ssid, count]) => ({ ssid, count }))

  return { bandDistribution, topSsids }
}

async function getVpnStats(days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabaseAdmin
    .from('speed_results')
    .select('device_id, vpn_status, download_mbps, upload_mbps')
    .gte('timestamp_utc', since)
    .order('timestamp_utc', { ascending: false })
    .limit(2000)

  const rows = data ?? []

  // Dedup to latest per device
  const seen = new Set<string>()
  const latest: Array<{ vpn_status: string | null; download_mbps: number | null; upload_mbps: number | null }> = []
  for (const row of rows) {
    if (!seen.has(row.device_id)) {
      seen.add(row.device_id)
      latest.push({
        vpn_status: row.vpn_status,
        download_mbps: row.download_mbps,
        upload_mbps: row.upload_mbps,
      })
    }
  }

  const distribution = { connected: 0, disconnected: 0, unknown: 0 }
  const speedBuckets: Record<'connected' | 'disconnected', { sumDown: number; sumUp: number; count: number }> = {
    connected: { sumDown: 0, sumUp: 0, count: 0 },
    disconnected: { sumDown: 0, sumUp: 0, count: 0 },
  }

  for (const { vpn_status, download_mbps, upload_mbps } of latest) {
    const status = vpn_status === 'connected' ? 'connected'
      : vpn_status === 'disconnected' ? 'disconnected'
      : null

    if (status === 'connected') {
      distribution.connected++
      if (download_mbps != null) {
        speedBuckets.connected.sumDown += download_mbps
        speedBuckets.connected.sumUp += upload_mbps ?? 0
        speedBuckets.connected.count++
      }
    } else if (status === 'disconnected') {
      distribution.disconnected++
      if (download_mbps != null) {
        speedBuckets.disconnected.sumDown += download_mbps
        speedBuckets.disconnected.sumUp += upload_mbps ?? 0
        speedBuckets.disconnected.count++
      }
    } else {
      distribution.unknown++
    }
  }

  const avgByStatus = {
    connected: {
      download: speedBuckets.connected.count > 0
        ? Math.round((speedBuckets.connected.sumDown / speedBuckets.connected.count) * 100) / 100
        : null,
      upload: speedBuckets.connected.count > 0
        ? Math.round((speedBuckets.connected.sumUp / speedBuckets.connected.count) * 100) / 100
        : null,
    },
    disconnected: {
      download: speedBuckets.disconnected.count > 0
        ? Math.round((speedBuckets.disconnected.sumDown / speedBuckets.disconnected.count) * 100) / 100
        : null,
      upload: speedBuckets.disconnected.count > 0
        ? Math.round((speedBuckets.disconnected.sumUp / speedBuckets.disconnected.count) * 100) / 100
        : null,
    },
  }

  return { distribution, avgByStatus }
}

export default async function TrendsPage({
  searchParams,
}: {
  searchParams: Promise<TrendsSearchParams>
}) {
  const params = await searchParams
  const rawDays = parseInt(params.days ?? '30', 10)
  const days = VALID_DAYS.includes(rawDays) ? rawDays : 30

  const [trendsData, timeOfDayData, wifiStats, vpnStats] = await Promise.all([
    getTrendsData(days),
    getTimeOfDayData(days),
    getWifiStats(days),
    getVpnStats(days),
  ])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Speed Trends</h1>

      {/* Day range selector */}
      <div className="flex gap-2 mb-8">
        {VALID_DAYS.map((d) => (
          <Link
            key={d}
            href={`?days=${d}`}
            className={
              d === days
                ? 'px-4 py-1.5 text-sm rounded-md font-bold border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'px-4 py-1.5 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors'
            }
          >
            {d}d
          </Link>
        ))}
      </div>

      {/* Fleet Download & Upload chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Fleet Download &amp; Upload
        </h2>
        <TrendsChart data={trendsData} />
      </div>

      {/* Time of Day heatmap */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Average Speed by Time of Day
        </h2>
        <TimeOfDayHeatmap data={timeOfDayData} />
        <p className="mt-3 text-xs text-gray-400">
          Hours shown in UTC. Each cell represents the average download speed
          recorded during that hour across all devices.
        </p>
      </div>

      {/* WiFi Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          WiFi Analytics
        </h2>
        <WifiBandChart
          bandDistribution={wifiStats.bandDistribution}
          topSsids={wifiStats.topSsids}
        />
      </div>

      {/* VPN Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          VPN Analytics
        </h2>
        <VpnStatsSection
          distribution={vpnStats.distribution}
          avgByStatus={vpnStats.avgByStatus}
        />
      </div>
    </div>
  )
}
