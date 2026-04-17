'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

type TabKey = 'overview' | 'history' | 'wifi'

interface DeviceTabsProps {
  children: {
    overview: React.ReactNode
    history: React.ReactNode
    wifi: React.ReactNode
  }
}

const tabs: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'history', label: 'History' },
  { key: 'wifi', label: 'WiFi' },
]

export default function DeviceTabs({ children }: DeviceTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = (searchParams.get('tab') as TabKey) ?? 'overview'

  function setTab(key: TabKey) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', key)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div>
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0 -mb-px" aria-label="Tabs">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={
                activeTab === key
                  ? 'px-5 py-3 text-sm font-medium border-b-2 border-indigo-500 text-indigo-600'
                  : 'px-5 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors'
              }
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
      <div>
        {activeTab === 'overview' && children.overview}
        {activeTab === 'history' && children.history}
        {activeTab === 'wifi' && children.wifi}
      </div>
    </div>
  )
}
