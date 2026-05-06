'use client'

import { VpnImpactRow } from '@/lib/analytics/types'

interface VpnImpactTableProps {
  rows: VpnImpactRow[]
}

function fmtMbps(v: number | null) {
  return v != null ? `${v.toFixed(1)}` : '—'
}

function fmtMs(v: number | null) {
  return v != null ? `${v.toFixed(0)}ms` : '—'
}

export default function VpnImpactTable({ rows }: VpnImpactTableProps) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-8 text-center">
        No VPN data available — devices need both connected and disconnected readings in the last 30 days
      </p>
    )
  }

  const displayRows = rows.slice(0, 50)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
            <th className="px-4 py-3 text-left">Hostname</th>
            <th className="px-4 py-3 text-right">On: Down</th>
            <th className="px-4 py-3 text-right">On: Up</th>
            <th className="px-4 py-3 text-right">On: Lat</th>
            <th className="px-4 py-3 text-right">Off: Down</th>
            <th className="px-4 py-3 text-right">Off: Up</th>
            <th className="px-4 py-3 text-right">Off: Lat</th>
            <th className="px-4 py-3 text-right">Impact</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row) => {
            const isHighImpact = row.delta_download != null && row.delta_download > 10
            return (
              <tr
                key={row.device_id}
                style={isHighImpact ? { backgroundColor: '#fef2f2' } : undefined}
                className="border-b border-gray-100"
              >
                <td className="px-4 py-3 text-gray-700 font-medium text-xs">
                  {row.hostname ?? row.device_id.slice(0, 12) + '…'}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-xs text-gray-600">
                  {fmtMbps(row.on_download)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-xs text-gray-600">
                  {fmtMbps(row.on_upload)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-xs text-gray-600">
                  {fmtMs(row.on_latency)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-xs text-gray-600">
                  {fmtMbps(row.off_download)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-xs text-gray-600">
                  {fmtMbps(row.off_upload)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-xs text-gray-600">
                  {fmtMs(row.off_latency)}
                </td>
                <td
                  className="px-4 py-3 text-right tabular-nums text-xs font-medium"
                  style={{
                    color: isHighImpact
                      ? '#991b1b'
                      : row.delta_download != null && row.delta_download < 0
                      ? '#15803d'
                      : '#374151',
                  }}
                >
                  {row.delta_download != null
                    ? `${row.delta_download > 0 ? '-' : '+'}${Math.abs(row.delta_download).toFixed(1)} Mbps`
                    : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {rows.length > 50 && (
        <p className="text-xs text-gray-400 px-4 py-2">
          Showing 50 of {rows.length} devices
        </p>
      )}
    </div>
  )
}
