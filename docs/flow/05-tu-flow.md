# 05 — TU Flow (Tata Usaha / Admin)

## Deskripsi

Alur lengkap pengalaman TU dari login hingga pengelolaan seluruh data administrasi kartu ujian.

---

## Alur Login

```
[Landing Page]
     ↓
[Klik "Akses TU/Guru"]
     ↓
[Halaman Login]
     ↓
[Input Email + Password]
     ↓
Supabase Auth: signInWithPassword()
     ↓
┌─────────────────────────────┐
│ Login berhasil?             │
├── TIDAK → Tampilkan error   │
└── YA   → Redirect dashboard │
└─────────────────────────────┘
     ↓
[Dashboard TU]
```

---

## Dashboard TU

Dashboard menjadi pusat navigasi seluruh fitur administrasi. Minimal menampilkan:

- Ringkasan data (jumlah siswa, kelas, jadwal).
- Navigasi ke semua modul.
- Informasi ujian yang sedang aktif.

---

## Modul: Data Siswa

### Tampilan Utama
- Daftar seluruh siswa dengan kolom: Nama, NISN, Kelas, Status Approval.
- Fitur pencarian/filter (minimal berdasarkan nama atau NISN).

### Operasi yang Tersedia

| Operasi | Deskripsi |
|---|---|
| **Tambah Siswa** | Form input: nama, NISN, kelas (pilih dari `classes`) |
| **Edit Siswa** | Update data siswa (nama, kelas) |
| **Hapus Siswa** | Hapus data siswa |
| **Approval** | Ubah `approval_status` dari `Pending` → `Approved` |

### Aturan
- NISN harus unik (constraint sudah ada di database: `students_nisn_key`).
- Siswa harus terhubung ke kelas yang valid (`class_id` mengacu ke `classes.id`).
- TU yang menentukan `approval_status` — siswa tidak dapat mengubah sendiri.

---

## Modul: Data Kelas

### Tampilan Utama
- Daftar kelas: Tingkat, Jurusan, Nama Kelas, Tahun Ajaran.

### Operasi yang Tersedia

| Operasi | Deskripsi |
|---|---|
| **Tambah Kelas** | Form: `grade`, `major`, `class_name`, `academic_year` |
| **Edit Kelas** | Update data kelas |
| **Hapus Kelas** | Hapus kelas (perhatikan relasi ke `students` dan `schedules`) |

---

## Modul: Data Jadwal

### Tampilan Utama
- Jadwal dikelompokkan per ujian dan per kelas.
- Tampilkan: Mata Pelajaran, Tanggal, Jam Mulai, Jam Selesai, Ruang.

### Operasi yang Tersedia

| Operasi | Deskripsi |
|---|---|
| **Tambah Jadwal** | Form: pilih ujian, pilih kelas, mata pelajaran, tanggal, jam, ruang |
| **Edit Jadwal** | Update data jadwal |
| **Hapus Jadwal** | Hapus jadwal |

### Aturan
- Jadwal **selalu** terhubung ke ujian tertentu (`exam_id`) dan kelas tertentu (`class_id`).
- Setiap kelas dapat memiliki jadwal yang berbeda-beda.
- Tidak ada batasan jumlah mata pelajaran per kelas per ujian.
- `room` bersifat opsional (nullable).

---

## Modul: Pengaturan Ujian

### Sub-modul: Data Ujian (`exams`)

| Operasi | Deskripsi |
|---|---|
| **Tambah Ujian** | Buat periode ujian baru |
| **Edit Ujian** | Update data ujian |
| **Aktifkan Ujian** | Set `is_active = true` (nonaktifkan yang lain jika perlu) |
| **Nonaktifkan Ujian** | Set `is_active = false` |

Field ujian:

| Field | Keterangan |
|---|---|
| `name` | Nama ujian (contoh: PSAT Ganjil 2024/2025) |
| `academic_year` | Tahun ajaran |
| `semester` | Semester (Ganjil / Genap) |
| `school_name` | Nama sekolah pada periode ini |
| `start_date` | Tanggal mulai ujian |
| `end_date` | Tanggal selesai ujian |
| `server_url` | Link/URL server ujian CBT |
| `is_active` | Status aktif ujian |

### Sub-modul: Pengaturan Kartu (`exam_settings`)

Setiap ujian memiliki satu `exam_settings` yang mengontrol tampilan kartu ujian.

| Setting | Tipe | Keterangan |
|---|---|---|
| `card_title` | text | Judul yang muncul di kartu ujian |
| `allow_print` | boolean | Izinkan siswa mencetak |
| `allow_download` | boolean | Izinkan siswa mengunduh PDF |
| `show_photo` | boolean | Tampilkan foto siswa |
| `show_room` | boolean | Tampilkan ruang ujian |
| `show_schedule` | boolean | Tampilkan jadwal di kartu |

---

## Modul: Kartu Ujian

### Tampilan Utama
- **Empty state** jika TU belum melakukan pencarian.
- Tidak menampilkan semua data siswa secara acak.

### Pencarian
- Berdasarkan **NISN** atau **Nama Siswa**.

### Setelah Pencarian
- Tampilkan daftar siswa yang sesuai.
- TU dapat melihat status kartu dan detail kartu ujian.

---

## Modul: Profil Sekolah

Mengelola data `school_profile` yang menjadi **source of truth** profil sekolah.

| Field | Keterangan |
|---|---|
| `school_name` | Nama sekolah |
| `npsn` | NPSN sekolah (unik) |
| `address` | Alamat sekolah |
| `phone` | Nomor telepon (opsional) |
| `email` | Email sekolah (opsional) |
| `logo_url` | URL logo sekolah (opsional) |

---

## Modul: Settings

Mengelola konfigurasi umum aplikasi melalui tabel `settings`.

> `TODO/NEEDS CONFIRMATION`: Detail field settings yang digunakan untuk konfigurasi apa saja.

---

## Logout

TU dapat logout dari sesi melalui tombol logout di dashboard. Session dihapus dari Supabase Auth.
