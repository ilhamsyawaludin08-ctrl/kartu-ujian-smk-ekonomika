# 09 — Page Specification

## Struktur Halaman Aplikasi

Berikut spesifikasi setiap halaman berdasarkan Next.js App Router.

---

## 1. Landing Page

**Route:** `/`
**Akses:** Publik (semua pengguna)
**File:** `src/app/page.tsx`

### Konten
- Judul/branding aplikasi.
- Dua pilihan akses:
  - **Siswa** → arahkan ke `/student`
  - **TU / Guru** → arahkan ke `/login`

### Aturan
- Tidak ada form di halaman ini.
- Tidak ada autentikasi yang diperlukan.
- Desain harus merepresentasikan identitas visual SMK Ekonomika.

---

## 2. Halaman Siswa

**Route:** `/student`
**Akses:** Publik
**File:** `src/app/student/page.tsx`

### Konten
- Form input **NISN** (single field).
- Tombol cari / submit.
- Area hasil:
  - Jika NISN tidak ditemukan → pesan error.
  - Jika status Pending → pesan pemberitahuan ke TU.
  - Jika Approved → preview kartu ujian + tombol Download + Cetak.

### Data Source
- `students`, `classes`, `exams`, `schedules`, `exam_settings`, `school_profile`

### Aturan
- Seluruh pengambilan data harus via **server-side** (Server Action atau Route Handler).
- Siswa tidak boleh melihat data siswa lain.
- Tidak ada form selain input NISN.

---

## 3. Halaman Login TU

**Route:** `/login`
**Akses:** Publik (redirect ke dashboard jika sudah login)
**File:** `src/app/login/page.tsx`

### Konten
- Form login: email + password.
- Tombol submit.
- Pesan error jika login gagal.

### Aturan
- Setelah login berhasil → redirect ke `/dashboard`.
- Jika sudah login → redirect langsung ke `/dashboard`.
- Autentikasi menggunakan Supabase Auth (`signInWithPassword`).

---

## 4. Dashboard TU

**Route:** `/dashboard`
**Akses:** `authenticated` (TU saja)
**File:** `src/app/dashboard/page.tsx`

### Konten
- Ringkasan data (jumlah siswa, kelas, jadwal).
- Info ujian yang sedang aktif.
- Navigasi ke semua modul.

### Aturan
- Redirect ke `/login` jika tidak ada session.
- Hanya role `authenticated` yang dapat mengakses.

---

## 5. Data Siswa

**Route:** `/dashboard/students`
**Akses:** `authenticated`
**File:** `src/app/dashboard/students/page.tsx`

### Konten
- Tabel daftar siswa: Nama, NISN, Kelas, Status Approval.
- Pencarian / filter siswa.
- Tombol Tambah Siswa.
- Per baris: tombol Edit, Hapus, Ubah Status Approval.

### Sub-halaman
- `/dashboard/students/new` — Form tambah siswa baru.
- `/dashboard/students/[id]/edit` — Form edit siswa.

---

## 6. Data Kelas

**Route:** `/dashboard/classes`
**Akses:** `authenticated`
**File:** `src/app/dashboard/classes/page.tsx`

### Konten
- Tabel daftar kelas: Tingkat, Jurusan, Nama Kelas, Tahun Ajaran.
- Tombol Tambah Kelas.
- Per baris: tombol Edit, Hapus.

### Sub-halaman
- `/dashboard/classes/new` — Form tambah kelas.
- `/dashboard/classes/[id]/edit` — Form edit kelas.

---

## 7. Data Jadwal

**Route:** `/dashboard/schedules`
**Akses:** `authenticated`
**File:** `src/app/dashboard/schedules/page.tsx`

### Konten
- Filter per ujian dan per kelas.
- Tabel jadwal: Mata Pelajaran, Tanggal, Jam Mulai, Jam Selesai, Ruang.
- Tombol Tambah Jadwal.
- Per baris: tombol Edit, Hapus.

### Sub-halaman
- `/dashboard/schedules/new` — Form tambah jadwal.
- `/dashboard/schedules/[id]/edit` — Form edit jadwal.

---

## 8. Pengaturan Ujian

**Route:** `/dashboard/exams`
**Akses:** `authenticated`
**File:** `src/app/dashboard/exams/page.tsx`

### Konten
- Daftar ujian: Nama, Tahun Ajaran, Semester, Status Aktif.
- Tombol Tambah Ujian.
- Per baris: tombol Edit, Aktifkan/Nonaktifkan, Pengaturan Kartu.

### Sub-halaman
- `/dashboard/exams/new` — Form tambah ujian.
- `/dashboard/exams/[id]/edit` — Form edit ujian + exam_settings.

---

## 9. Kartu Ujian (TU View)

**Route:** `/dashboard/exam-cards`
**Akses:** `authenticated`
**File:** `src/app/dashboard/exam-cards/page.tsx`

### Konten
- **State awal:** Empty state — belum ada pencarian.
- Form pencarian: NISN atau Nama siswa.
- Setelah pencarian: daftar siswa + status kartu.
- TU dapat melihat detail kartu ujian siswa.

### Aturan
- Jangan menampilkan semua data siswa secara default (empty state dahulu).
- Pencarian harus dilakukan eksplisit oleh TU.

---

## 10. Profil Sekolah

**Route:** `/dashboard/school-profile`
**Akses:** `authenticated`
**File:** `src/app/dashboard/school-profile/page.tsx`

### Konten
- Form edit data `school_profile`:
  - Nama sekolah, NPSN, Alamat, Telepon, Email, Logo.
- Tombol Simpan.

### Aturan
- `school_profile` adalah source of truth untuk profil sekolah.
- Perubahan di sini berdampak pada kartu ujian semua siswa.

---

## 11. Settings Aplikasi

**Route:** `/dashboard/settings`
**Akses:** `authenticated`
**File:** `src/app/dashboard/settings/page.tsx`

### Konten
- Form edit konfigurasi umum dari tabel `settings`.

> `TODO/NEEDS CONFIRMATION` — Detail field settings yang dikelola di halaman ini.

---

## Middleware & Proteksi Route

**File:** `src/middleware.ts`

Seluruh route `/dashboard/*` harus dilindungi:
- Jika tidak ada session → redirect ke `/login`.
- Session dikelola via Supabase Auth + cookie.

---

## Struktur Folder App Router

```
src/app/
├── page.tsx                          ← Landing Page
├── layout.tsx                        ← Root layout
├── login/
│   └── page.tsx                      ← Login TU
├── student/
│   └── page.tsx                      ← Portal Siswa
└── dashboard/
    ├── page.tsx                      ← Dashboard
    ├── layout.tsx                    ← Dashboard layout (auth guard)
    ├── students/
    │   ├── page.tsx
    │   ├── new/page.tsx
    │   └── [id]/edit/page.tsx
    ├── classes/
    │   ├── page.tsx
    │   ├── new/page.tsx
    │   └── [id]/edit/page.tsx
    ├── schedules/
    │   ├── page.tsx
    │   ├── new/page.tsx
    │   └── [id]/edit/page.tsx
    ├── exams/
    │   ├── page.tsx
    │   ├── new/page.tsx
    │   └── [id]/edit/page.tsx
    ├── exam-cards/
    │   └── page.tsx
    ├── school-profile/
    │   └── page.tsx
    └── settings/
        └── page.tsx
```

> ⚠️ Struktur di atas adalah **rencana**. Implementasi aktual dapat berbeda sedikit, tetapi prinsip dan route harus konsisten.
