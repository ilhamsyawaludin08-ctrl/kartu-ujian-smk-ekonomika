# 02 — Business Flow

## Gambaran Umum Alur Bisnis

Aplikasi memiliki dua jalur utama yang terpisah: **Portal Siswa** dan **Portal TU**. Kedua jalur dimulai dari Landing Page.

---

## Landing Page

```
Landing Page
├── [Akses Siswa]  → Portal Siswa
└── [Akses TU]    → Halaman Login TU
```

---

## Alur Portal Siswa

```
Halaman Siswa
↓
Input NISN
↓
[Server-side] Cari data di students WHERE nisn = input
↓
┌─────────────────────────────────────────────┐
│ Data siswa ditemukan?                        │
├── TIDAK → Tampilkan pesan "NISN tidak        │
│            ditemukan"                        │
└── YA   → Lanjut ↓                           │
└─────────────────────────────────────────────┘
↓
Ambil class_id dari students
↓
Ambil data kelas dari classes WHERE id = class_id
↓
Ambil ujian aktif dari exams WHERE is_active = true
↓
Ambil jadwal dari schedules
  WHERE exam_id = ujian_aktif.id
  AND class_id = siswa.class_id
↓
Ambil exam_settings WHERE exam_id = ujian_aktif.id
↓
Cek exam_cards WHERE student_id = siswa.id AND exam_id = ujian_aktif.id
↓
Cek students.approval_status
↓
┌─────────────────────────────────────────────────────┐
│ approval_status == 'Pending' (atau belum approved)   │
├── Tampilkan pemberitahuan ke TU untuk approval       │
├── JANGAN tampilkan kartu ujian                       │
├── JANGAN izinkan download                            │
└── JANGAN izinkan cetak                               │
└─────────────────────────────────────────────────────┘
↓
┌────────────────────────────────────────────────────┐
│ approval_status == 'Approved'                       │
├── Tampilkan identitas siswa                         │
├── Tampilkan preview kartu ujian                     │
├── Sediakan tombol Download PDF                      │
└── Sediakan tombol Cetak                             │
└────────────────────────────────────────────────────┘
```

---

## Alur Portal TU

```
Halaman Login TU
↓
Input email + password
↓
Autentikasi via Supabase Auth (role: authenticated)
↓
Dashboard TU
↓
┌──────────────────────────────────────┐
│ Menu Navigasi Dashboard              │
├── Data Siswa                         │
├── Data Kelas                         │
├── Data Jadwal                        │
├── Pengaturan Ujian                   │
├── Kartu Ujian                        │
└── Profil Sekolah / Settings          │
└──────────────────────────────────────┘
```

### Sub-alur: Data Siswa

```
Data Siswa
├── Tampilkan daftar siswa
├── Tambah siswa baru (INSERT)
├── Edit data siswa (UPDATE)
├── Hapus siswa (DELETE)
└── Approval status siswa
    ├── Pending → Approved
    └── Approved → Pending (jika diperlukan)
```

### Sub-alur: Data Kelas

```
Data Kelas
├── Tampilkan daftar kelas
├── Tambah kelas baru
├── Edit kelas
└── Hapus kelas
```

### Sub-alur: Data Jadwal

```
Data Jadwal
├── Tampilkan jadwal per kelas per ujian
├── Tambah jadwal (mata pelajaran, tanggal, jam, ruang)
├── Edit jadwal
└── Hapus jadwal
```

### Sub-alur: Pengaturan Ujian

```
Pengaturan Ujian
├── Tampilkan daftar ujian (exams)
├── Tambah/Edit ujian
├── Atur exam_settings per ujian
│   ├── allow_print
│   ├── allow_download
│   ├── show_photo
│   ├── show_room
│   ├── show_schedule
│   └── card_title
└── Aktifkan/nonaktifkan ujian (is_active)
```

### Sub-alur: Kartu Ujian

```
Kartu Ujian
├── Cari siswa (berdasarkan NISN atau Nama)
├── [Belum cari] → Tampilkan empty state
└── [Setelah cari]
    ├── Tampilkan hasil siswa
    ├── Lihat status kartu
    └── Lihat detail kartu
```

### Sub-alur: Profil Sekolah / Settings

```
Profil Sekolah
└── Edit data school_profile
    ├── Nama sekolah
    ├── NPSN
    ├── Alamat
    ├── Telepon
    ├── Email
    └── Logo

Settings
└── Konfigurasi umum aplikasi
```

---

## Aturan Bisnis Penting

| # | Aturan |
|---|---|
| 1 | Siswa **tidak** memilih kelas, jurusan, atau jadwal sendiri. |
| 2 | Kelas siswa diambil otomatis dari `students.class_id`. |
| 3 | Jadwal siswa otomatis berdasarkan `class_id` dan ujian aktif. |
| 4 | Siswa dengan status `Pending` **tidak dapat** melihat/mengunduh/mencetak kartu. |
| 5 | Satu siswa dapat memiliki kartu ujian dari beberapa periode berbeda. |
| 6 | Kartu ujian lama **tidak otomatis dihapus** saat ada ujian baru. |
| 7 | Hanya TU (role `authenticated`) yang dapat melakukan CRUD data. |
| 8 | Siswa mengakses data hanya melalui server-side logic, bukan akses langsung ke database. |
