'use client'

import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface SparklineProps {
  data: { value: number }[]
  color?: string
}

export default function Sparkline({ data, color = '#6366f1' }: SparklineProps) {
  if (data.length === 0) {
    return <div className="h-12 bg-gray-50 rounded" />
  }

  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data}>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={color}
          dot={false}
          isAnimationActive={false}
          fillOpacity={0.15}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
