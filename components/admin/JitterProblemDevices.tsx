'use client'

import Link from 'next/link'

interface JitterDevice {
  device_id: string
  hostname: string | null
  avg_jitter: number
}

interface JitterProblemDevicesProps {
  devices: JitterDevice[]
  fleetAvg: number
}

export default function JitterProblemDevices({ devices, fleetAvg }: JitterProblemDevicesProps) {
  if (devices.length === 0) {
    return (
      <p className="px-6 py-8 text-center text-gray-400 text-sm">
        No jitter data recorded in the last 24 hours.
      </p>
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4 px-6 pt-4">
        Fleet average jitter (last 24h):{' '}
        <span className="font-semibold text-gray-700">{fleetAvg.toFixed(1)} ms</span>
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Device</th>
              <th className="px-4 py-3">Hostname</th>
              <th className="px-4 py-3 text-right">Avg Jitter (ms)</th>
              <th className="px-4 py-3 text-right">vs Fleet Avg</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {devices.map((d) => {
              const delta = d.avg_jitter - fleetAvg
              const isHigh = delta > 0
              return (
                <tr key={d.device_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/devices/${d.device_id}`}
                      className="text-blue-600 hover:underline font-mono text-xs"
                    >
                      {d.device_id.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {d.hostname ?? <span className="text-gray-400 italic">unknown</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-900">
                    {d.avg_jitter.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span
                      className="text-xs font-medium"
                      style={{ color: isHigh ? '#dc2626' : '#16a34a' }}
                    >
                      {isHigh ? '+' : ''}{delta.toFixed(1)} ms
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
