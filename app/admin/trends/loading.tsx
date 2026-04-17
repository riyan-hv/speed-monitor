export default function TrendsLoading() {
  return (
    <div className="p-8">
      <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mb-8" />
      {/* Day selector skeleton */}
      <div className="flex gap-2 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
      {/* Chart skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
      </div>
      {/* Second chart skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-[200px] bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  )
}
