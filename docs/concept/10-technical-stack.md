# 10 — Technical Stack

## Overview

Aplikasi ini dibangun menggunakan stack JavaScript/TypeScript modern dengan Next.js sebagai framework utama dan Supabase sebagai backend-as-a-service.

---

## Frontend

| Teknologi | Versi | Keterangan |
|---|---|---|
| **Next.js** | 16.3.0 | Framework React — App Router |
| **React** | 19.2.8 | UI Library |
| **TypeScript** | ^5 | Type safety |
| **Tailwind CSS** | ^4 | Utility-first CSS framework |

---

## Backend / Database

| Teknologi | Keterangan |
|---|---|
| **Supabase** | Backend-as-a-Service (PostgreSQL 17.6) |
| **Supabase Auth** | Autentikasi TU via email + password |
| **Supabase RLS** | Row Level Security — 32 policies aktif |

---

## Supabase Packages

| Package | Versi | Fungsi |
|---|---|---|
| `@supabase/supabase-js` | 2.112.3 | Core Supabase client |
| `@supabase/ssr` | 0.12.4 | SSR support untuk Next.js App Router |

---

## Dev Dependencies

| Package | Versi | Keterangan |
|---|---|---|
| `@tailwindcss/postcss` | ^4 | PostCSS integration Tailwind |
| `@types/node` | ^20 | TypeScript types untuk Node.js |
| `@types/react` | ^19 | TypeScript types untuk React |
| `@types/react-dom` | ^19 | TypeScript types untuk React DOM |
| `eslint` | ^9 | Linting |
| `eslint-config-next` | 16.3.0 | ESLint config untuk Next.js |
| `typescript` | ^5 | TypeScript compiler |

---

## Arsitektur Next.js App Router

```
src/
├── app/                    ← App Router pages
│   ├── layout.tsx          ← Root layout
│   ├── page.tsx            ← Landing page
│   ├── login/
│   ├── student/
│   └── dashboard/
├── components/             ← Reusable UI components
├── lib/
│   ├── supabase/
│   │   ├── client.ts       ← Browser client ('use client')
│   │   ├── server.ts       ← Server client (Server Components)
│   │   └── middleware.ts   ← Middleware client (session refresh)
│   ├── pdf/                ← PDF generation utilities
│   ├── print/              ← Print utilities
│   └── utils/              ← General utilities
├── types/                  ← TypeScript type definitions
└── middleware.ts            ← Next.js middleware (auth session)
```

---

## Supabase Client Architecture

Terdapat 3 client Supabase yang dipisah berdasarkan konteks:

| File | Digunakan Di | Fungsi |
|---|---|---|
| `src/lib/supabase/client.ts` | Client Components (`use client`) | Browser-side queries |
| `src/lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers | Server-side queries dengan cookie |
| `src/lib/supabase/middleware.ts` | `src/middleware.ts` | Refresh auth session |

---

## Environment Variables

| Variable | Scope | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (browser safe) | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public (browser safe) | Publishable key Supabase |

> ⚠️ `service_role` key **tidak boleh** ada di environment variable `NEXT_PUBLIC_*` atau di source code client.

File environment:
- `.env.local` — tidak di-commit ke Git (sudah ada di `.gitignore` dengan pattern `.env*`).

---

## Aturan Stack

| Aturan | Status |
|---|---|
| Gunakan TypeScript untuk semua file | ✅ WAJIB |
| Gunakan Next.js App Router | ✅ WAJIB |
| Gunakan Supabase yang sudah dikonfigurasi | ✅ WAJIB |
| Jangan menggunakan Python sebagai stack | ❌ DILARANG |
| Jangan mengganti framework (Vue, Angular, dll.) | ❌ DILARANG |
| Jangan mengganti database (MySQL, MongoDB, dll.) | ❌ DILARANG |

---

## Library Tambahan (Belum Diputuskan)

Library berikut mungkin diperlukan untuk fitur tertentu, namun **belum dikonfirmasi**:

| Kebutuhan | Library Kandidat | Status |
|---|---|---|
| Generate PDF | `jsPDF`, `react-pdf`, `@react-pdf/renderer` | `TODO/NEEDS CONFIRMATION` |
| CSS Print | Native CSS `@media print` | Kemungkinan cukup |
| Form validation | `zod`, `react-hook-form` | `TODO/NEEDS CONFIRMATION` |
| Toast/notification | `sonner`, `react-hot-toast` | `TODO/NEEDS CONFIRMATION` |
| Icon | `lucide-react`, `heroicons` | `TODO/NEEDS CONFIRMATION` |

> ⚠️ Jangan install library baru yang tidak ada di daftar ini tanpa konfirmasi, terutama library yang mempengaruhi bundle size atau arsitektur.

---

## Node.js

- Runtime: **Node.js** (versi kompatibel dengan Next.js 16).
- Package manager: **npm**.
- Jangan menggunakan Bun atau Deno tanpa konfirmasi.
