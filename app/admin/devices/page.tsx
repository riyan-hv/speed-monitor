import { supabaseAdmin } from '@/lib/supabase/admin'
import { computeHealthStatus } from '@/lib/admin/health'
import DeviceTable, { DeviceRow } from '@/components/admin/DeviceTable'

export const dynamic = 'force-dynamic'

type ValidSortColumn = 'download_mbps' | 'upload_mbps' | 'latency_ms' | 'timestamp_utc' | 'hostname' | 'band' | 'vpn_status'

const VALID_SORT_COLUMNS: ValidSortColumn[] = [
  'download_mbps',
  'upload_mbps',
  'latency_ms',
  'timestamp_utc',
  'hostname',
  'band',
  'vpn_status',
]

interface SearchParams {
  sort?: string
  order?: string
  vpn?: string
  band?: string
}

export default async function DevicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const sort = VALID_SORT_COLUMNS.includes(params.sort as ValidSortColumn)
    ? (params.sort as ValidSortColumn)
    : 'timestamp_utc'
  const order = params.order === 'asc' ? 'asc' : 'desc'
  const vpnFilter = params.vpn
  const bandFilter = params.band

  // Fetch latest result per device: get recent 2000 rows and dedup in JS
  // (DISTINCT ON not available via JS Supabase client)
  let query = supabaseAdmin
    .from('speed_results')
    .select('device_id, hostname, download_mbps, upload_mbps, latency_ms, timestamp_utc, band, vpn_status')
    .order('timestamp_utc', { ascending: false })
    .limit(2000)

  if (vpnFilter) {
    query = query.eq('vpn_status', vpnFilter)
  }
  if (bandFilter) {
    query = query.eq('band', bandFilter)
  }

  const { data: rawResults } = await query

  // Dedup to latest per device
  const seen = new Set<string>()
  const lastPerDevice: Array<{
    device_id: string
    hostname: string | null
    download_mbps: number | null
    upload_mbps: number | null
    latency_ms: number | null
    timestamp_utc: string | null
    band: string | null
    vpn_status: string | null
  }> = []

  for (const row of rawResults ?? []) {
    if (!seen.has(row.device_id)) {
      seen.add(row.device_id)
      lastPerDevice.push(row)
    }
  }

  // Get download baselines for health computation
  const { data: baselines } = await supabaseAdmin
    .from('device_baselines')
    .select('device_id, mean, std_dev')
    .eq('metric', 'download_mbps')

  const baselineMap = new Map(
    (baselines ?? []).map((b) => [b.device_id, b])
  )

  // Build DeviceRow array with health
  let devices: DeviceRow[] = lastPerDevice.map((r) => {
    const baseline = baselineMap.get(r.device_id)
    const health = computeHealthStatus(
      r.download_mbps,
      baseline?.mean ?? null,
      baseline?.std_dev ?? null,
      r.timestamp_utc,
    )
    return {
      device_id: r.device_id,
      hostname: r.hostname,
      health,
      download_mbps: r.download_mbps,
      upload_mbps: r.upload_mbps,
      latency_ms: r.latency_ms,
      timestamp_utc: r.timestamp_utc,
      band: r.band,
      vpn_status: r.vpn_status,
    }
  })

  // Sort in JS
  devices.sort((a, b) => {
    let aVal: string | number | null
    let bVal: string | number | null

    if (sort === 'timestamp_utc') {
      aVal = a.timestamp_utc ? new Date(a.timestamp_utc).getTime() : 0
      bVal = b.timestamp_utc ? new Date(b.timestamp_utc).getTime() : 0
    } else if (sort === 'hostname') {
      aVal = a.hostname ?? ''
      bVal = b.hostname ?? ''
    } else if (sort === 'band') {
      aVal = a.band ?? ''
      bVal = b.band ?? ''
    } else if (sort === 'vpn_status') {
      aVal = a.vpn_status ?? ''
      bVal = b.vpn_status ?? ''
    } else {
      aVal = a[sort as 'download_mbps' | 'upload_mbps' | 'latency_ms'] ?? 0
      bVal = b[sort as 'download_mbps' | 'upload_mbps' | 'latency_ms'] ?? 0
    }

    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Devices
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({devices.length} total)
        </span>
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <DeviceTable devices={devices} sort={sort} order={order} />
      </div>
    </div>
  )
}
