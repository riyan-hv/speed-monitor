import SkeletonCard from '@/components/admin/SkeletonCard'

export default function AdminLoading() {
  return (
    <div className="p-8">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-4 w-72 bg-gray-100 rounded animate-pulse mb-8" />
      {/* Health strip skeleton */}
      <div className="h-12 bg-gray-100 rounded-xl animate-pulse mb-8" />
      {/* Stat card skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      {/* Sparkline skeleton */}
      <div className="h-16 bg-gray-100 rounded-xl animate-pulse mb-8" />
      {/* Heatmap skeleton */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-6 gap-2">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
