'use client'

import { useState } from 'react'
import React from 'react'

type TabKey = 'overview' | 'history' | 'wifi'

interface DeviceTabsProps {
  defaultTab?: TabKey
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

export default function DeviceTabs({ defaultTab = 'overview', children }: DeviceTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab)

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0 -mb-px" aria-label="Tabs">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={
                activeTab === key
                  ? 'px-5 py-3 text-sm font-medium border-b-2 border-blue-500 text-blue-600'
                  : 'px-5 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors'
              }
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && children.overview}
        {activeTab === 'history' && children.history}
        {activeTab === 'wifi' && children.wifi}
      </div>
    </div>
  )
}
