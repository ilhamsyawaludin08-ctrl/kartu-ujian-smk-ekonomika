import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase client untuk Server Components, Server Actions, dan Route Handlers.
 * Gunakan file ini di komponen tanpa directive 'use client'.
 *
 * Menggunakan cookies() dari next/headers untuk membaca session user secara server-side.
 * Key yang digunakan: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
 * Jangan pernah menaruh service_role key di variabel NEXT_PUBLIC_*.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll dipanggil dari Server Component — diabaikan.
            // Middleware bertanggung jawab untuk menyegarkan session.
          }
        },
      },
    }
  )
}
