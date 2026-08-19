# 11 — Security and Access

## Overview

Keamanan aplikasi dibangun di atas beberapa lapisan: **Supabase RLS**, **Supabase Auth**, **Next.js Middleware**, dan **server-side data fetching**.

---

## Lapisan Keamanan

```
Browser / Client
    ↓
Next.js Middleware         ← Cek session setiap request
    ↓
Server Component / Route Handler / Server Action
    ↓
Supabase Client (server.ts)
    ↓
Supabase API
    ↓
PostgreSQL + RLS Policy    ← Enforcement final di level database
```

---

## Supabase Row Level Security (RLS)

### Status

- RLS **ENABLED** pada seluruh 8 tabel.
- Total: **32 RLS policies** (4 per tabel: SELECT, INSERT, UPDATE, DELETE).

### Policy Pattern

Semua policy menggunakan kondisi:
- Role: `authenticated`
- USING: `true` (semua row dapat diakses oleh TU yang sudah login)
- WITH CHECK: `true` (semua data dapat ditulis oleh TU yang sudah login)

### Daftar Policy

| Tabel | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `classes` | ✅ authenticated | ✅ authenticated | ✅ authenticated | ✅ authenticated |
| `students` | ✅ authenticated | ✅ authenticated | ✅ authenticated | ✅ authenticated |
| `exams` | ✅ authenticated | ✅ authenticated | ✅ authenticated | ✅ authenticated |
| `schedules` | ✅ authenticated | ✅ authenticated | ✅ authenticated | ✅ authenticated |
| `exam_settings` | ✅ authenticated | ✅ authenticated | ✅ authenticated | ✅ authenticated |
| `exam_cards` | ✅ authenticated | ✅ authenticated | ✅ authenticated | ✅ authenticated |
| `settings` | ✅ authenticated | ✅ authenticated | ✅ authenticated | ✅ authenticated |
| `school_profile` | ✅ authenticated | ✅ authenticated | ✅ authenticated | ✅ authenticated |

### Policy untuk Anon

> ❌ **Tidak ada policy untuk role `anon`.**

Tidak ada akses database langsung yang diberikan kepada pengguna yang tidak login.

---

## Supabase Auth

- TU login menggunakan **email + password** melalui Supabase Auth.
- Setelah login, TU mendapat session JWT dengan role `authenticated`.
- Session disimpan dalam cookie dan di-refresh oleh Next.js Middleware.

---

## Next.js Middleware

**File:** `src/middleware.ts`

- Dijalankan pada setiap request yang cocok dengan matcher.
- Memanggil `updateSession()` dari `src/lib/supabase/middleware.ts`.
- Memastikan session cookie Supabase selalu diperbarui.
- Proteksi route `/dashboard/*` → redirect ke `/login` jika tidak ada session.

---

## Akses Data Siswa (Server-Side)

Siswa mengakses data hanya melalui **server-side logic** di Next.js:

```
Siswa (Browser)
    ↓ Input NISN
Next.js Server (Server Action / Route Handler)
    ↓ Query database
Supabase (dengan kontrol akses yang tepat)
    ↓ Return data
Next.js Server
    ↓ Filter & format data
Siswa (Browser) ← Menerima data yang sudah difilter
```

> ✅ Siswa **tidak pernah** melakukan query langsung ke Supabase dari browser.

---

## Credential Management

### Environment Variables

| Variable | Nilai | Keamanan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project | ✅ Aman di browser |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key | ✅ Aman di browser |
| `SUPABASE_SERVICE_ROLE_KEY` | *(tidak digunakan saat ini)* | ⛔ Jangan pernah di NEXT_PUBLIC_ |

### Aturan Credential

| Aturan | Status |
|---|---|
| `service_role` key TIDAK boleh ada di browser | ✅ WAJIB |
| `service_role` key TIDAK boleh ada di `NEXT_PUBLIC_*` | ✅ WAJIB |
| `service_role` key TIDAK boleh di-commit ke Git | ✅ WAJIB |
| `.env.local` tidak di-commit ke Git | ✅ SUDAH (`.env*` di `.gitignore`) |
| Credential tidak muncul di output/log | ✅ WAJIB |

---

## Proteksi Route

| Route | Akses | Proteksi |
|---|---|---|
| `/` | Publik | — |
| `/student` | Publik | Semua pengguna bisa akses |
| `/login` | Publik (redirect jika sudah login) | — |
| `/dashboard` | `authenticated` saja | Redirect ke `/login` jika tidak ada session |
| `/dashboard/*` | `authenticated` saja | Redirect ke `/login` jika tidak ada session |

---

## Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Siswa mengakses data siswa lain | Data difilter server-side berdasarkan NISN input — tidak ada endpoint yang mengembalikan semua data siswa |
| Akses langsung ke Supabase API dari browser | RLS memblokir semua akses `anon` |
| Kebocoran `service_role` key | Tidak digunakan di client, tidak ada di `NEXT_PUBLIC_*` |
| Session TU kadaluarsa | Middleware refresh session setiap request |
| SQL Injection | Supabase client menggunakan parameterized queries secara default |

---

## Aturan Keamanan untuk AGY

> ⚠️ AGY **dilarang**:
> - Menambahkan policy `anon` yang memberikan akses bebas ke tabel apapun.
> - Menaruh `service_role` key di mana pun di sisi client.
> - Mengubah RLS policy tanpa persetujuan eksplisit.
> - Membuat endpoint publik yang mengembalikan data siswa tanpa filter yang tepat.
> - Meng-commit credential ke Git.
