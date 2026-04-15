'use client'

import Link from 'next/link'
import { HealthStatus } from '@/lib/admin/health'

interface DeviceCell {
  device_id: string
  hostname: string | null
  health: HealthStatus
  last_download: number | null
}

interface DeviceHeatmapProps {
  devices: DeviceCell[]
}

const HEALTH_HEX: Record<HealthStatus, string> = {
  green: '#22c55e',
  yellow: '#facc15',
  red: '#ef4444',
  unknown: '#d1d5db',
}

export default function DeviceHeatmap({ devices }: DeviceHeatmapProps) {
  if (devices.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        No devices have reported yet
      </div>
    )
  }

  return (
    <div className="grid gap-2 grid-cols-8 md:grid-cols-12 lg:grid-cols-16">
      {devices.map((device) => {
        const title = `${device.hostname ?? device.device_id} — ${
          device.last_download != null ? device.last_download.toFixed(1) : '?'
        } Mbps`
        return (
          <Link
            key={device.device_id}
            href={`/admin/devices/${device.device_id}`}
            title={title}
            className="h-10 w-full rounded block"
            style={{ backgroundColor: HEALTH_HEX[device.health] }}
          />
        )
      })}
    </div>
  )
}
