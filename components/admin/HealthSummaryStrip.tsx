interface HealthSummaryStripProps {
  critical: number
  warning: number
  healthy: number
  unknown: number
  total: number
}

const HEALTH_CONFIG = [
  {
    label: 'Critical',
    key: 'critical' as const,
    hex: '#ef4444',
    bg: '#fef2f2',
    textHex: '#991b1b',
  },
  {
    label: 'Warning',
    key: 'warning' as const,
    hex: '#facc15',
    bg: '#fefce8',
    textHex: '#854d0e',
  },
  {
    label: 'Healthy',
    key: 'healthy' as const,
    hex: '#22c55e',
    bg: '#f0fdf4',
    textHex: '#166534',
  },
]

export default function HealthSummaryStrip({
  critical,
  warning,
  healthy,
  total,
}: HealthSummaryStripProps) {
  const counts = { critical, warning, healthy }

  return (
    <div className="flex items-center gap-4 px-5 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
      {HEALTH_CONFIG.map(({ label, key, hex, bg, textHex }) => (
        <div
          key={key}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: bg }}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: hex }}
          />
          <span
            className="text-xl font-bold tabular-nums"
            style={{ color: textHex }}
          >
            {counts[key]}
          </span>
          <span className="text-xs font-medium" style={{ color: textHex }}>
            {label}
          </span>
        </div>
      ))}
      <div className="ml-auto text-xs text-gray-400">{total} total devices</div>
    </div>
  )
}
