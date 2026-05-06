'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { SsidRow } from '@/lib/analytics/types'

interface SsidBarChartProps {
  rows: SsidRow[]
}

export default function SsidBarChart({ rows }: SsidBarChartProps) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No SSID data in the last 30 days</p>
  }

  return (
    <div>
      {/* Bar chart: download + upload per SSID */}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={rows} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <XAxis dataKey="ssid" tick={{ fontSize: 11 }} interval={0} />
          <YAxis unit=" Mbps" tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => (v as number).toFixed(1) + ' Mbps'} />
          <Legend />
          <Bar dataKey="avg_download" name="Download" fill="#6366f1" radius={[3, 3, 0, 0]} />
          <Bar dataKey="avg_upload" name="Upload" fill="#a5b4fc" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="pb-2 text-left">SSID</th>
              <th className="pb-2 text-right">Devices</th>
              <th className="pb-2 text-right">Avg Download</th>
              <th className="pb-2 text-right">Avg Upload</th>
              <th className="pb-2 text-right">Avg Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr key={row.ssid} className="hover:bg-gray-50">
                <td className="py-2 pr-4 font-medium text-gray-800">{row.ssid}</td>
                <td className="py-2 text-right text-gray-600 tabular-nums">{row.device_count}</td>
                <td className="py-2 text-right tabular-nums text-gray-700">
                  {row.avg_download != null ? row.avg_download.toFixed(1) + ' Mbps' : '—'}
                </td>
                <td className="py-2 text-right tabular-nums text-gray-700">
                  {row.avg_upload != null ? row.avg_upload.toFixed(1) + ' Mbps' : '—'}
                </td>
                <td className="py-2 text-right tabular-nums text-gray-700">
                  {row.avg_latency != null ? row.avg_latency.toFixed(0) + ' ms' : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
