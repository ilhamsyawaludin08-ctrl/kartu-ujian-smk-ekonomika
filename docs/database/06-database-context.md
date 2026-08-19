# 06 — Database Context

## Platform

**Supabase** — PostgreSQL 17.6

**Project:** `kartu-ujian-smk-ekonomika`
**Project Ref:** `tucyauiymflctrjchupp`
**Region:** `ap-southeast-1` (Singapore)

> ⚠️ Jangan mengubah struktur database (tabel, kolom, foreign key, tipe data) tanpa persetujuan eksplisit.

---

## Daftar Tabel

| # | Tabel | RLS | Baris Saat Ini |
|---|---|---|---|
| 1 | `classes` | ✅ ENABLED | 1 |
| 2 | `students` | ✅ ENABLED | 0 |
| 3 | `exams` | ✅ ENABLED | 1 |
| 4 | `schedules` | ✅ ENABLED | 0 |
| 5 | `settings` | ✅ ENABLED | 0 |
| 6 | `exam_settings` | ✅ ENABLED | 0 |
| 7 | `exam_cards` | ✅ ENABLED | 0 |
| 8 | `school_profile` | ✅ ENABLED | 0 |

---

## Struktur Tabel Detail

### `classes` — Data Kelas

| Kolom | Tipe | Nullable | Default | Keterangan |
|---|---|---|---|---|
| `id` | bigint | NO | — | Primary Key |
| `created_at` | timestamptz | NO | `now()` | — |
| `grade` | text | NO | — | Tingkat (X, XI, XII) |
| `major` | text | NO | — | Jurusan |
| `class_name` | text | NO | — | Nama kelas |
| `academic_year` | text | NO | — | Tahun ajaran |
| `updated_at` | timestamptz | NO | `now()` | — |

---

### `students` — Data Siswa

| Kolom | Tipe | Nullable | Default | Keterangan |
|---|---|---|---|---|
| `id` | bigint | NO | — | Primary Key |
| `created_at` | timestamptz | NO | `now()` | — |
| `nisn` | text | NO | — | NISN siswa (UNIQUE) |
| `name` | text | NO | — | Nama siswa |
| `class_id` | bigint | NO | — | FK → `classes.id` |
| `approval_status` | text | NO | — | Status: `Pending` / `Approved` |
| `updated_at` | timestamptz | NO | `now()` | — |

**Unique Index:** `students_nisn_key` — NISN harus unik.

---

### `exams` — Data Ujian / Periode

| Kolom | Tipe | Nullable | Default | Keterangan |
|---|---|---|---|---|
| `id` | bigint | NO | — | Primary Key |
| `created_at` | timestamptz | NO | `now()` | — |
| `name` | text | NO | — | Nama ujian |
| `academic_year` | text | NO | — | Tahun ajaran |
| `semester` | text | NO | — | Semester |
| `school_name` | text | NO | — | Nama sekolah pada periode ini |
| `start_date` | date | NO | — | Tanggal mulai |
| `end_date` | date | NO | — | Tanggal selesai |
| `server_url` | text | NO | — | URL server ujian CBT |
| `is_active` | boolean | NO | `false` | Status aktif ujian |
| `updated_at` | timestamptz | NO | `now()` | — |

---

### `schedules` — Jadwal Ujian

| Kolom | Tipe | Nullable | Default | Keterangan |
|---|---|---|---|---|
| `id` | bigint | NO | — | Primary Key |
| `created_at` | timestamptz | NO | `now()` | — |
| `exam_id` | bigint | NO | — | FK → `exams.id` |
| `class_id` | bigint | NO | — | FK → `classes.id` |
| `subject` | text | NO | — | Mata pelajaran |
| `exam_date` | date | NO | — | Tanggal ujian mata pelajaran |
| `start_time` | time | NO | — | Jam mulai |
| `end_time` | time | NO | — | Jam selesai |
| `room` | text | **YES** | — | Ruang ujian (opsional) |
| `is_active` | boolean | NO | `false` | Status aktif jadwal |
| `updated_at` | timestamptz | NO | `now()` | — |

---

### `exam_settings` — Pengaturan Kartu Ujian

| Kolom | Tipe | Nullable | Default | Keterangan |
|---|---|---|---|---|
| `id` | bigint | NO | — | Primary Key |
| `created_at` | timestamptz | NO | `now()` | — |
| `exam_id` | bigint | NO | — | FK → `exams.id` |
| `card_title` | text | NO | — | Judul kartu ujian |
| `allow_print` | boolean | NO | `true` | Izinkan cetak |
| `allow_download` | boolean | NO | `true` | Izinkan download PDF |
| `show_photo` | boolean | NO | `true` | Tampilkan foto siswa |
| `show_room` | boolean | NO | `true` | Tampilkan ruang |
| `show_schedule` | boolean | NO | `true` | Tampilkan jadwal |
| `updated_at` | timestamptz | NO | `now()` | — |

---

### `exam_cards` — Kartu Ujian

| Kolom | Tipe | Nullable | Default | Keterangan |
|---|---|---|---|---|
| `id` | bigint | NO | — | Primary Key |
| `created_at` | timestamptz | NO | `now()` | — |
| `student_id` | bigint | NO | — | FK → `students.id` |
| `exam_id` | bigint | NO | — | FK → `exams.id` |
| `card_number` | text | NO | — | Nomor kartu |
| `status` | text | NO | `'ACTIVE'::text` | Status kartu |
| `issued_at` | timestamptz | NO | `now()` | Waktu diterbitkan |
| `updated_at` | timestamptz | NO | `now()` | — |

---

### `settings` — Konfigurasi Umum Aplikasi

| Kolom | Tipe | Nullable | Default | Keterangan |
|---|---|---|---|---|
| `id` | bigint | NO | — | Primary Key |
| `created_at` | timestamptz | NO | `now()` | — |
| `school_name` | text | NO | — | — |
| `school_address` | text | NO | — | — |
| `school_phone` | text | YES | — | — |
| `school_email` | text | NO | — | — |
| `school_logo_url` | text | YES | `null` | Default diperbaiki dari `'NULL'::text` |
| `principal_name` | text | NO | — | Nama kepala sekolah |
| `principal_nip` | text | NO | — | NIP kepala sekolah |
| `updated_at` | timestamptz | NO | `now()` | — |

> ⚠️ `settings` digunakan untuk konfigurasi **umum aplikasi**, bukan source of truth profil sekolah.

---

### `school_profile` — Profil Sekolah (Source of Truth)

| Kolom | Tipe | Nullable | Default | Keterangan |
|---|---|---|---|---|
| `id` | bigint | NO | — | Primary Key |
| `created_at` | timestamptz | NO | `now()` | — |
| `updated_at` | timestamptz | NO | `now()` | — |
| `school_name` | text | NO | — | Nama sekolah |
| `npsn` | text | NO | — | NPSN (UNIQUE) |
| `address` | text | NO | — | Alamat |
| `phone` | text | YES | — | Telepon |
| `email` | text | YES | — | Email |
| `logo_url` | text | YES | — | URL logo |

**Unique Index:** `school_profile_npsn_key` — NPSN harus unik.

> ✅ `school_profile` adalah **SOURCE OF TRUTH** untuk profil sekolah yang ditampilkan di kartu ujian.

---

## Relasi / Foreign Key

```
classes.id ──────────────────┬──→ students.class_id
                              └──→ schedules.class_id

exams.id ────────────────────┬──→ schedules.exam_id
                              ├──→ exam_settings.exam_id
                              └──→ exam_cards.exam_id

students.id ─────────────────└──→ exam_cards.student_id
```

| Constraint | Source | → Target |
|---|---|---|
| `students_class_id_fkey` | `students.class_id` | `classes.id` |
| `schedules_class_id_fkey` | `schedules.class_id` | `classes.id` |
| `schedules_exam_id_fkey` | `schedules.exam_id` | `exams.id` |
| `exam_settings_exam_id_fkey` | `exam_settings.exam_id` | `exams.id` |
| `exam_cards_student_id_fkey` | `exam_cards.student_id` | `students.id` |
| `exam_cards_exam_id_fkey` | `exam_cards.exam_id` | `exams.id` |

---

## RLS Policy Summary

Total: **32 policies** — 4 per tabel (SELECT, INSERT, UPDATE, DELETE).
Semua policy menggunakan role `authenticated`.
Tidak ada policy untuk role `anon`.

---

## Aturan Penting Database

1. **Jangan membuat tabel baru** tanpa persetujuan.
2. **Jangan menghapus tabel** apapun.
3. **Jangan mengubah tipe data kolom** yang sudah ada.
4. **Jangan mengubah foreign key** yang sudah ada.
5. **Jangan mengubah RLS policy** tanpa persetujuan.
6. Jika ada kebutuhan perubahan database: **STOP dan laporkan terlebih dahulu**.
