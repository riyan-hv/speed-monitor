'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { HealthStatus, HEALTH_LABELS } from '@/lib/admin/health'

export interface DeviceRow {
  device_id: string
  hostname: string | null
  health: HealthStatus
  download_mbps: number | null
  upload_mbps: number | null
  latency_ms: number | null
  timestamp_utc: string | null
  band: string | null
  vpn_status: string | null
}

interface DeviceTableProps {
  devices: DeviceRow[]
  sort: string
  order: string
}

const HEALTH_HEX: Record<HealthStatus, string> = {
  green: '#22c55e',
  yellow: '#facc15',
  red: '#ef4444',
  unknown: '#d1d5db',
}

const HEALTH_TEXT: Record<HealthStatus, string> = {
  green: '#166534',
  yellow: '#854d0e',
  red: '#991b1b',
  unknown: '#6b7280',
}

function relativeTime(isoString: string | null): string {
  if (!isoString) return 'Never'
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const SORTABLE_COLUMNS: Array<{ key: string; label: string }> = [
  { key: 'hostname', label: 'Hostname' },
  { key: 'health', label: 'Health' },
  { key: 'last_seen', label: 'Last Seen' },
  { key: 'download_mbps', label: 'Download' },
  { key: 'upload_mbps', label: 'Upload' },
  { key: 'latency_ms', label: 'Latency' },
  { key: 'band', label: 'WiFi Band' },
  { key: 'vpn_status', label: 'VPN' },
]

export default function DeviceTable({ devices, sort, order }: DeviceTableProps) {
  const router = useRouter()

  function handleSort(column: string) {
    const newOrder = sort === column && order === 'desc' ? 'asc' : 'desc'
    router.push(`/admin/devices?sort=${column}&order=${newOrder}`)
  }

  function sortIcon(column: string) {
    if (sort !== column) return ' '
    return order === 'asc' ? ' ^' : ' v'
  }

  if (devices.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        No devices found
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-gray-200">
            {SORTABLE_COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-900 select-none whitespace-nowrap"
                onClick={() => handleSort(key)}
              >
                {label}
                <span className="text-gray-400">{sortIcon(key)}</span>
              </th>
            ))}
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {devices.map((device) => (
            <tr key={device.device_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">
                {device.hostname ?? (
                  <span className="text-gray-400 font-mono text-xs">
                    {device.device_id.slice(0, 8)}…
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: HEALTH_HEX[device.health] + '33',
                    color: HEALTH_TEXT[device.health],
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full mr-1.5"
                    style={{ backgroundColor: HEALTH_HEX[device.health] }}
                  />
                  {HEALTH_LABELS[device.health]}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {relativeTime(device.timestamp_utc)}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {device.download_mbps != null ? `${device.download_mbps.toFixed(1)}` : '—'}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {device.upload_mbps != null ? `${device.upload_mbps.toFixed(1)}` : '—'}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {device.latency_ms != null ? `${device.latency_ms.toFixed(0)} ms` : '—'}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {device.band ?? '—'}
              </td>
              <td className="px-4 py-3">
                {device.vpn_status == null ? (
                  <span className="text-gray-400">—</span>
                ) : device.vpn_status === 'active' ? (
                  <span className="text-green-700 text-xs font-medium">Active</span>
                ) : (
                  <span className="text-gray-400 text-xs">{device.vpn_status}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/devices/${device.device_id}`}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
