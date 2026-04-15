'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface BandDistribution {
  '2.4GHz': number
  '5GHz': number
  '6GHz': number
  unknown: number
}

interface TopSsid {
  ssid: string
  count: number
}

interface WifiBandChartProps {
  bandDistribution: BandDistribution
  topSsids: TopSsid[]
}

export default function WifiBandChart({ bandDistribution, topSsids }: WifiBandChartProps) {
  const totalDevices = Object.values(bandDistribution).reduce((s, n) => s + n, 0)

  const bandData = [
    { band: '2.4 GHz', count: bandDistribution['2.4GHz'] },
    { band: '5 GHz',   count: bandDistribution['5GHz'] },
    { band: '6 GHz',   count: bandDistribution['6GHz'] },
    { band: 'Unknown', count: bandDistribution.unknown },
  ].filter((d) => d.count > 0)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Band distribution bar chart */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Band Distribution</h3>
        {totalDevices === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No WiFi data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={bandData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <XAxis dataKey="band" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [value, 'Devices']}
              />
              <Bar dataKey="count" name="Devices" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top SSIDs list */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Top SSIDs</h3>
        {topSsids.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No SSID data available</p>
        ) : (
          <ul className="space-y-2">
            {topSsids.slice(0, 8).map(({ ssid, count }) => {
              const pct = totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0
              return (
                <li key={ssid} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="truncate text-gray-700 font-mono text-xs">{ssid || '(hidden)'}</span>
                      <span className="text-gray-500 text-xs ml-2 whitespace-nowrap">{count} devices</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: '#3b82f6' }}
                      />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
