'use client'

import { useRouter } from 'next/navigation'

interface Device {
  deviceId: string
  hostname: string | null
}

export default function DevicePicker({ devices }: { devices: Device[] }) {
  const router = useRouter()

  return (
    <ul className="space-y-3">
      {devices.map((device) => (
        <li key={device.deviceId}>
          <button
            onClick={() => router.push(`/my/${device.deviceId}`)}
            className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all text-left"
          >
            <div>
              <div className="font-medium text-gray-900">
                {device.hostname ?? device.deviceId}
              </div>
              {device.hostname && (
                <div className="text-sm text-gray-500 mt-0.5">{device.deviceId}</div>
              )}
            </div>
            <span className="text-gray-400 text-lg">→</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
