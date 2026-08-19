# 01 — Project Overview

## Nama Project

**Kartu Ujian SMK Ekonomika**

## Deskripsi Singkat

Aplikasi web yang digunakan oleh siswa dan staf Tata Usaha (TU) SMK Ekonomika untuk pengelolaan serta pengambilan kartu ujian secara digital.

## Tujuan Utama

- Mempermudah siswa dalam mengakses kartu ujian tanpa perlu antri ke TU.
- Mempermudah TU dalam mengelola data siswa, kelas, jadwal, dan kartu ujian.
- Mengurangi penggunaan dokumen fisik dalam proses distribusi kartu ujian.

## Pengguna

| Pengguna | Cara Akses | Autentikasi |
|---|---|---|
| **Siswa** | Portal Siswa — input NISN | ❌ Tidak login |
| **TU / Admin** | Portal TU — login dengan akun | ✅ Login via Supabase Auth |

## Ruang Lingkup Fitur (Scope)

### Portal Siswa
- Input NISN untuk pencarian data.
- Tampilkan kartu ujian berdasarkan data siswa.
- Download kartu ujian dalam format PDF.
- Cetak kartu ujian.

### Portal TU
- Login dan dashboard administrasi.
- Manajemen data siswa (CRUD + Approval).
- Manajemen kelas.
- Manajemen jadwal ujian per kelas.
- Manajemen periode/jenis ujian.
- Pengaturan tampilan kartu ujian (`exam_settings`).
- Manajemen kartu ujian (lihat, cari).
- Pengaturan profil sekolah (`school_profile`).
- Konfigurasi umum aplikasi (`settings`).

## Out of Scope

Fitur-fitur berikut **tidak termasuk** dalam scope project ini kecuali ada kesepakatan baru:

- Sistem absensi.
- Nilai/rapor siswa.
- Manajemen guru.
- Notifikasi email/SMS otomatis.
- Integrasi sistem eksternal selain Supabase.

## Status Project

| Komponen | Status |
|---|---|
| Database & Tabel | ✅ Selesai |
| RLS Policy | ✅ Selesai (32 policies) |
| Koneksi Supabase → Next.js | ✅ Selesai |
| Dokumentasi Konteks | ✅ Dalam proses |
| Implementasi Fitur | ⏳ Belum dimulai |

## Referensi Terkait

- `06-database-context.md` — Struktur database lengkap.
- `03-user-roles.md` — Detail hak akses setiap pengguna.
- `10-technical-stack.md` — Stack teknologi yang digunakan.
