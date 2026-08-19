# 03 — User Roles

## Daftar Role

Aplikasi ini memiliki **dua jenis pengguna**:

| Role | Nama | Autentikasi | Akses Database |
|---|---|---|---|
| `authenticated` | TU / Admin | Login via Supabase Auth | Penuh (CRUD semua tabel) |
| *(tidak ada role)* | Siswa | Tidak login — input NISN | Via server-side logic saja |

---

## Role: TU / Admin

### Identitas
- Staf Tata Usaha (TU) sekolah atau administrator sistem.
- Login menggunakan email + password melalui Supabase Auth.
- Setelah login, mendapat role Supabase `authenticated`.

### Hak Akses Database

Semua 8 tabel dapat diakses penuh oleh TU:

| Tabel | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `classes` | ✅ | ✅ | ✅ | ✅ |
| `students` | ✅ | ✅ | ✅ | ✅ |
| `exams` | ✅ | ✅ | ✅ | ✅ |
| `schedules` | ✅ | ✅ | ✅ | ✅ |
| `exam_settings` | ✅ | ✅ | ✅ | ✅ |
| `exam_cards` | ✅ | ✅ | ✅ | ✅ |
| `settings` | ✅ | ✅ | ✅ | ✅ |
| `school_profile` | ✅ | ✅ | ✅ | ✅ |

### Fitur yang Dapat Diakses

- Dashboard TU
- Manajemen Data Siswa (CRUD + Approval)
- Manajemen Data Kelas (CRUD)
- Manajemen Jadwal Ujian (CRUD)
- Manajemen Ujian / Periode (CRUD)
- Pengaturan Kartu Ujian (`exam_settings`)
- Pencarian dan Lihat Kartu Ujian
- Profil Sekolah (`school_profile`)
- Konfigurasi Aplikasi (`settings`)

---

## Role: Siswa

### Identitas
- Siswa SMK Ekonomika.
- **Tidak memiliki akun** di Supabase Auth.
- Mengakses portal hanya dengan memasukkan **NISN**.

### Hak Akses Database

Siswa **tidak memiliki akses langsung** ke database Supabase.

Seluruh pencarian dan pengambilan data siswa dilakukan melalui **server-side logic** di Next.js (menggunakan Supabase dengan kontrol akses yang tepat di sisi server).

> ⚠️ Tidak ada policy RLS yang memberikan akses `anon` ke tabel manapun.

### Informasi yang Dapat Dilihat Siswa

Bergantung pada `exam_settings` dan `approval_status`:

| Data | Syarat Tampil |
|---|---|
| Nama siswa | Selalu (jika ditemukan) |
| NISN | Selalu (jika ditemukan) |
| Kelas | Selalu (jika ditemukan) |
| Jurusan | Selalu (jika ditemukan) |
| Jadwal ujian | `show_schedule = true` di `exam_settings` |
| Ruang ujian | `show_room = true` di `exam_settings` |
| Foto siswa | `show_photo = true` di `exam_settings` |
| Kartu ujian | `approval_status = 'Approved'` |
| Download PDF | `approval_status = 'Approved'` + `allow_download = true` |
| Cetak | `approval_status = 'Approved'` + `allow_print = true` |

### Batasan Siswa

- ❌ Tidak dapat memilih kelas sendiri.
- ❌ Tidak dapat memilih jurusan sendiri.
- ❌ Tidak dapat memilih jadwal sendiri.
- ❌ Tidak dapat mengubah data apapun.
- ❌ Tidak dapat melihat data siswa lain.
- ❌ Tidak dapat melihat kartu ujian jika status masih `Pending`.

---

## Approval Status Siswa

`students.approval_status` menentukan apakah siswa dapat mengakses kartu ujian.

| Status | Arti | Akses Kartu |
|---|---|---|
| `Pending` | Menunggu verifikasi TU | ❌ Tidak bisa akses kartu |
| `Approved` | Sudah diverifikasi TU | ✅ Bisa akses kartu |

> `TODO/NEEDS CONFIRMATION`: Apakah ada status lain selain `Pending` dan `Approved`? (misal: `Rejected`, `Inactive`)

---

## Catatan Keamanan

- `service_role` key Supabase **tidak boleh** diekspos ke browser atau client-side code.
- Seluruh akses data siswa harus melalui server-side Next.js.
- Session TU dikelola oleh Supabase Auth dan di-refresh via middleware Next.js.
