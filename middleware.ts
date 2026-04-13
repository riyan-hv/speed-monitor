import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// Run middleware on all routes except static assets and Next.js internals.
// NOTE: Middleware alone is NOT sufficient for auth (CVE-2025-29927: x-middleware-subrequest bypass).
// Every protected Route Handler MUST also call supabase.auth.getUser() internally.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
