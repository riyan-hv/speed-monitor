'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteDeviceButton({ deviceId, hostname }: { deviceId: string; hostname: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleFirstClick() {
    setConfirming(true)
    setTimeout(() => setConfirming(false), 5000)
  }

  function handleConfirm() {
    startTransition(async () => {
      await fetch(`/api/devices/${deviceId}`, { method: 'DELETE' })
      router.push('/admin/devices')
    })
  }

  if (isPending) {
    return (
      <button disabled className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 border border-gray-200 rounded-md">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Deleting…
      </button>
    )
  }

  if (confirming) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="text-sm text-gray-600">Delete <strong>{hostname}</strong>?</span>
        <button
          onClick={handleConfirm}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 border border-red-600 rounded-md transition-colors"
        >
          Yes, delete
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleFirstClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-md transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Delete Device
    </button>
  )
}
