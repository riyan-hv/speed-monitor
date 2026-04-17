export default function AlertsLoading() {
  return (
    <div className="p-8">
      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mb-8" />
      {/* Alert config form skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
      {/* Alert list skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="h-10 bg-gray-50 border-b border-gray-100 animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 border-b border-gray-50 px-6 flex items-center gap-4 animate-pulse">
            <div className="h-3 flex-1 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
            <div className="h-6 w-6 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
