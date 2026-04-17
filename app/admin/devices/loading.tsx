export default function DevicesLoading() {
  return (
    <div className="p-8">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-4 w-56 bg-gray-100 rounded animate-pulse mb-8" />
      {/* Filter pill skeletons */}
      <div className="flex gap-2 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-7 w-20 bg-gray-200 rounded-full animate-pulse" />
        ))}
      </div>
      {/* Table skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="h-10 bg-gray-50 border-b border-gray-100 animate-pulse" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-14 border-b border-gray-50 px-6 flex items-center gap-4 animate-pulse">
            <div className="w-3 h-3 rounded-full bg-gray-200" />
            <div className="h-3 flex-1 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
            <div className="h-3 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
