'use client'

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-96">
      <p className="text-sm font-medium text-gray-500 mb-2">Failed to load analytics data</p>
      <p className="text-xs text-gray-400 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
      >
        Try again
      </button>
    </div>
  )
}
