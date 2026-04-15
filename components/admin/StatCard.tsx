interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  sublabel?: string
}

export default function StatCard({ label, value, unit, sublabel }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      {sublabel && <p className="mt-1 text-xs text-gray-400">{sublabel}</p>}
    </div>
  )
}
