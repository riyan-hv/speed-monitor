export default function AnalyticsLoading() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="h-7 w-32 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-56 bg-gray-100 rounded animate-pulse" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-3 w-64 bg-gray-100 rounded animate-pulse mb-4" />
          <div className="h-48 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}
