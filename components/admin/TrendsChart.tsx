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

interface TrendsDataPoint {
  date: string
  avg_download: number
  avg_upload: number
}

interface TrendsChartProps {
  data: TrendsDataPoint[]
}

export default function TrendsChart({ data }: TrendsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
        No data available for this period
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis unit=" Mbps" tick={{ fontSize: 12 }} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) =>
            typeof value === 'number' ? value.toFixed(1) + ' Mbps' : value
          }
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="avg_download"
          name="Download"
          stroke="#3b82f6"
          dot={false}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="avg_upload"
          name="Upload"
          stroke="#10b981"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
