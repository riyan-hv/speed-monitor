'use client'

import { useState } from 'react'

interface AlertFormProps {
  onSaved: () => void
}

interface FormState {
  name: string
  metric: 'download_mbps' | 'upload_mbps' | 'latency_ms'
  threshold: string
  scope: 'all' | 'device'
  deviceId: string
  submitting: boolean
  error: string | null
}

export default function AlertForm({ onSaved }: AlertFormProps) {
  const [form, setForm] = useState<FormState>({
    name: '',
    metric: 'download_mbps',
    threshold: '',
    scope: 'all',
    deviceId: '',
    submitting: false,
    error: null,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Client-side validation
    if (form.name.trim() === '') {
      setForm((f) => ({ ...f, error: 'Rule name is required' }))
      return
    }
    const thresholdNum = parseFloat(form.threshold)
    if (!isFinite(thresholdNum) || thresholdNum <= 0) {
      setForm((f) => ({ ...f, error: 'Threshold must be a positive number' }))
      return
    }
    if (form.scope === 'device' && form.deviceId.trim() === '') {
      setForm((f) => ({ ...f, error: 'Device ID is required when scope is "Specific device"' }))
      return
    }

    setForm((f) => ({ ...f, submitting: true, error: null }))

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          metric: form.metric,
          threshold: thresholdNum,
          scope: form.scope,
          device_id: form.scope === 'device' ? form.deviceId.trim() : undefined,
        }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? 'Failed to save rule')
      }

      // Reset form on success
      setForm({
        name: '',
        metric: 'download_mbps',
        threshold: '',
        scope: 'all',
        deviceId: '',
        submitting: false,
        error: null,
      })
      onSaved()
    } catch (err) {
      setForm((f) => ({
        ...f,
        submitting: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {form.error && (
        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {form.error}
        </div>
      )}

      {/* Rule name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rule Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Low download speed alert"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Metric */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Metric
        </label>
        <select
          value={form.metric}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              metric: e.target.value as FormState['metric'],
            }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="download_mbps">Download (Mbps)</option>
          <option value="upload_mbps">Upload (Mbps)</option>
          <option value="latency_ms">Latency (ms)</option>
        </select>
      </div>

      {/* Threshold */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Threshold Value
        </label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={form.threshold}
          onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))}
          placeholder="e.g. 10"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Scope */}
      <div>
        <span className="block text-sm font-medium text-gray-700 mb-2">
          Scope
        </span>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="scope"
              value="all"
              checked={form.scope === 'all'}
              onChange={() => setForm((f) => ({ ...f, scope: 'all', deviceId: '' }))}
              className="accent-blue-600"
            />
            All devices
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="scope"
              value="device"
              checked={form.scope === 'device'}
              onChange={() => setForm((f) => ({ ...f, scope: 'device' }))}
              className="accent-blue-600"
            />
            Specific device
          </label>
        </div>
      </div>

      {/* Device ID (conditional) */}
      {form.scope === 'device' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Device ID
          </label>
          <input
            type="text"
            value={form.deviceId}
            onChange={(e) => setForm((f) => ({ ...f, deviceId: e.target.value }))}
            placeholder="e.g. abc123-device-uuid"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={form.submitting}
        className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {form.submitting ? 'Saving…' : 'Save Rule'}
      </button>
    </form>
  )
}
