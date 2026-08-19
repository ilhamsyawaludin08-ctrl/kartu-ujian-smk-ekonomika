import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js Middleware — dijalankan pada setiap request yang cocok dengan matcher.
 * Tugasnya: menyegarkan Supabase auth session agar tetap valid.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match semua path kecuali:
     * - _next/static  (file statis Next.js)
     * - _next/image   (optimasi gambar Next.js)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
