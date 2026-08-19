import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client untuk Browser / Client Components.
 * Gunakan file ini di komponen yang memiliki directive 'use client'.
 *
 * Key yang digunakan: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (aman untuk browser).
 * Jangan pernah menaruh service_role key di sini.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
