export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-24" />
        <div className="h-7 bg-gray-200 rounded w-16" />
        <div className="h-2 bg-gray-100 rounded w-20" />
      </div>
    </div>
  )
}
