import React from 'react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  body: string
  cta?: React.ReactNode
}

export default function EmptyState({ icon, title, body, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-xs text-gray-400 max-w-xs">{body}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  )
}
