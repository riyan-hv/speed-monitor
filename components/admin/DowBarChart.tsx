'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { DowRow } from '@/lib/analytics/types'

interface DowBarChartProps {
  rows: DowRow[]  // always 7 rows Mon–Sun
}

const WEEKEND = ['Sat', 'Sun']

export default function DowBarChart({ rows }: DowBarChartProps) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">No data</p>
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={rows} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis unit=" Mbps" tick={{ fontSize: 11 }} width={55} />
          <Tooltip
            formatter={(v) => v != null ? (v as number).toFixed(1) + ' Mbps' : 'No data'}
          />
          <Bar dataKey="avg_download" name="Avg Download" radius={[4, 4, 0, 0]}>
            {rows.map((entry, index) => (
              <Cell key={index} fill={WEEKEND.includes(entry.day) ? '#a5b4fc' : '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-2 text-center">
        UTC days · fleet avg download · 30-day window
      </p>
    </div>
  )
}
