export default function DeviceDetailLoading() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-6" />
      {/* Device header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse shrink-0" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
      {/* Tab bar skeleton */}
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        {['Overview', 'History', 'WiFi'].map(l => (
          <div key={l} className="px-5 py-3 h-10 w-24 bg-gray-100 rounded animate-pulse mr-1" />
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-[280px] bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  )
}
