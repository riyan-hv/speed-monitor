'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface SpeedDataPoint {
  timestamp_utc: string
  download_mbps: number | null
  upload_mbps: number | null
}

type Range = '24h' | '7d'

interface DeviceSpeedChartProps {
  data24h: SpeedDataPoint[]
  data7d: SpeedDataPoint[]
}

function formatTick(timestamp: string, range: Range): string {
  const d = new Date(timestamp)
  if (range === '7d') {
    return (
      d.toLocaleDateString([], { month: '2-digit', day: '2-digit' }) +
      ' ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
  }
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function DeviceSpeedChart({ data24h, data7d }: DeviceSpeedChartProps) {
  const [range, setRange] = useState<Range>('24h')
  const data = range === '24h' ? data24h : data7d

  if (data24h.length === 0 && data7d.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm bg-gray-50 rounded-lg border border-gray-200">
        No data available
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Speed History</h2>
        <div className="flex rounded-md border border-gray-200 overflow-hidden">
          {(['24h', '7d'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                range === r ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm bg-gray-50 rounded-lg border border-gray-200">
          No data for selected range
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="timestamp_utc"
              tickFormatter={(v) => formatTick(v, range)}
              tick={{ fontSize: 11 }}
              minTickGap={40}
            />
            <YAxis
              unit=" Mbps"
              tick={{ fontSize: 11 }}
              width={72}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [typeof value === 'number' ? value.toFixed(1) + ' Mbps' : '—', undefined] as any}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(label: any) => new Date(String(label)).toLocaleString()}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="download_mbps"
              name="Download"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="upload_mbps"
              name="Upload"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
