interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  sublabel?: string
  icon: React.ReactNode
  accent: string // Tailwind bg color class e.g. "bg-blue-500"
}

export default function StatCard({ label, value, unit, sublabel, icon, accent }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
      <div className={`${accent} w-10 h-10 rounded-lg flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900 tabular-nums">{value}</span>
          {unit && <span className="text-sm text-gray-400 font-medium">{unit}</span>}
        </div>
        {sublabel && <p className="mt-0.5 text-xs text-gray-400">{sublabel}</p>}
      </div>
    </div>
  )
}
