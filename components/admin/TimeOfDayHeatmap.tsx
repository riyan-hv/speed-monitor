'use client'

interface HourDataPoint {
  hour: number
  avg_download: number | null
}

interface TimeOfDayHeatmapProps {
  data: HourDataPoint[]
}

function cellColor(avg_download: number | null, max: number): string {
  if (avg_download == null) return '#f3f4f6'
  const ratio = avg_download / max
  if (ratio > 0.8) return '#22c55e'
  if (ratio > 0.5) return '#facc15'
  if (ratio > 0)   return '#f87171'
  return '#f3f4f6'
}

export default function TimeOfDayHeatmap({ data }: TimeOfDayHeatmapProps) {
  const max = Math.max(...data.map((d) => d.avg_download ?? 0), 1)

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(24, minmax(0, 1fr))',
          gap: '4px',
        }}
      >
        {data.map((d) => (
          <div key={d.hour} className="flex flex-col items-center">
            <div
              style={{
                backgroundColor: cellColor(d.avg_download, max),
                height: '40px',
                borderRadius: '4px',
                width: '100%',
              }}
              title={`${d.hour}:00 — ${d.avg_download?.toFixed(1) ?? 'no data'} Mbps`}
            />
            <span className="text-xs text-gray-400 mt-1" style={{ fontSize: '10px' }}>
              {d.hour % 6 === 0 ? d.hour : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
