'use client'

interface VpnDistribution {
  connected: number
  disconnected: number
  unknown: number
}

interface VpnSpeedEntry {
  download: number | null
  upload: number | null
}

interface VpnAvgByStatus {
  connected: VpnSpeedEntry
  disconnected: VpnSpeedEntry
}

interface VpnStatsSectionProps {
  distribution: VpnDistribution
  avgByStatus: VpnAvgByStatus
}

export default function VpnStatsSection({ distribution, avgByStatus }: VpnStatsSectionProps) {
  const total = distribution.connected + distribution.disconnected + distribution.unknown
  const connectedPct = total > 0 ? Math.round((distribution.connected / total) * 100) : 0

  const cards = [
    {
      label: 'VPN Connected',
      value: total > 0 ? `${connectedPct}%` : '—',
      sub: `${distribution.connected} of ${total} devices`,
      bg: '#eff6ff',
      color: '#1d4ed8',
    },
    {
      label: 'Avg Download — VPN On',
      value: avgByStatus.connected.download != null
        ? `${avgByStatus.connected.download.toFixed(1)} Mbps`
        : '—',
      sub: 'fleet average',
      bg: '#f0fdf4',
      color: '#15803d',
    },
    {
      label: 'Avg Download — VPN Off',
      value: avgByStatus.disconnected.download != null
        ? `${avgByStatus.disconnected.download.toFixed(1)} Mbps`
        : '—',
      sub: 'fleet average',
      bg: '#fefce8',
      color: '#854d0e',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map(({ label, value, sub, bg, color }) => (
        <div
          key={label}
          className="rounded-lg p-4 border"
          style={{ backgroundColor: bg, borderColor: color + '33' }}
        >
          <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color }}>
            {label}
          </p>
          <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          <p className="text-xs mt-0.5" style={{ color: color + 'aa' }}>{sub}</p>
        </div>
      ))}
    </div>
  )
}
