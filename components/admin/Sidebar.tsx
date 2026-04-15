'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

interface SidebarProps {
  userEmail: string
}

const navLinks = [
  { href: '/admin', label: 'Fleet', abbr: 'F' },
  { href: '/admin/devices', label: 'Devices', abbr: 'D' },
  { href: '/admin/trends', label: 'Trends', abbr: 'T' },
  { href: '/admin/alerts', label: 'Alerts', abbr: 'A' },
]

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  function isActive(href: string) {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-56 h-full bg-gray-900 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">Speed Monitor</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navLinks.map(({ href, label, abbr }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={
                active
                  ? 'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-gray-700 text-white'
                  : 'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors'
              }
            >
              <span className="w-5 h-5 flex items-center justify-center rounded text-xs font-bold bg-gray-600 text-gray-200">
                {abbr}
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + sign out */}
      <div className="px-3 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 truncate mb-2" title={userEmail}>
          {userEmail}
        </p>
        <button
          onClick={handleSignOut}
          className="w-full text-left text-xs text-gray-400 hover:text-white transition-colors px-2 py-1.5 rounded hover:bg-gray-800"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
