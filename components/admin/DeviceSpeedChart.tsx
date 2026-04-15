'use client'

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

interface DeviceSpeedChartProps {
  data: SpeedDataPoint[]
}

function formatTick(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function DeviceSpeedChart({ data }: DeviceSpeedChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm bg-gray-50 rounded-lg border border-gray-200">
        No data in the last 24 hours
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="timestamp_utc"
          tickFormatter={formatTick}
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
  )
}
