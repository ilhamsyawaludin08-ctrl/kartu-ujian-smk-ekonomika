# 04 — Student Flow

## Deskripsi

Alur lengkap pengalaman siswa dari membuka aplikasi hingga mendapatkan kartu ujian.

---

## Diagram Alur Lengkap

```
[Landing Page]
     ↓
[Klik "Akses Siswa"]
     ↓
[Halaman Siswa]
     ↓
[Input NISN]
     ↓
[Submit]
     ↓
Server: SELECT * FROM students WHERE nisn = $input
     ↓
┌────────────────────────────────────┐
│ Apakah siswa ditemukan?            │
├── TIDAK                            │
│   └── Tampilkan: "NISN tidak       │
│        ditemukan. Hubungi TU."     │
│   └── Kembali ke form input        │
└── YA → Lanjut                      │
└────────────────────────────────────┘
     ↓
Ambil: students.class_id
     ↓
Server: SELECT * FROM classes WHERE id = class_id
     ↓
Server: SELECT * FROM exams WHERE is_active = true LIMIT 1
     ↓
┌────────────────────────────────────────┐
│ Apakah ada ujian aktif?                │
├── TIDAK                                │
│   └── Tampilkan: "Tidak ada ujian      │
│        yang sedang berlangsung."       │
└── YA → Lanjut                          │
└────────────────────────────────────────┘
     ↓
Server: SELECT * FROM schedules
        WHERE exam_id = ujian.id
        AND class_id = siswa.class_id
        ORDER BY exam_date, start_time
     ↓
Server: SELECT * FROM exam_settings
        WHERE exam_id = ujian.id
     ↓
Server: SELECT * FROM exam_cards
        WHERE student_id = siswa.id
        AND exam_id = ujian.id
     ↓
Cek: students.approval_status
     ↓
┌────────────────────────────────────────────────────────────┐
│ approval_status = 'Pending'                                 │
│   └── Tampilkan pesan:                                      │
│        "Data Anda sedang menunggu persetujuan TU.           │
│         Silakan hubungi petugas Tata Usaha."                │
│   └── JANGAN tampilkan kartu ujian                          │
│   └── JANGAN tampilkan tombol Download                      │
│   └── JANGAN tampilkan tombol Cetak                         │
└────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ approval_status = 'Approved'                                 │
│   └── Tampilkan identitas siswa                              │
│   └── Tampilkan preview kartu ujian                          │
│   └── [Jika allow_download = true] Tombol Download PDF       │
│   └── [Jika allow_print = true]    Tombol Cetak              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data yang Digunakan Dalam Kartu Ujian

Kartu ujian adalah **gabungan** dari beberapa sumber data:

| Sumber Data | Field yang Digunakan |
|---|---|
| `students` | `name`, `nisn`, `class_id` |
| `classes` | `grade`, `major`, `class_name`, `academic_year` |
| `exams` | `name`, `academic_year`, `semester`, `start_date`, `end_date` |
| `schedules` | `subject`, `exam_date`, `start_time`, `end_time`, `room` |
| `exam_settings` | `card_title`, `show_photo`, `show_room`, `show_schedule`, `allow_print`, `allow_download` |
| `school_profile` | `school_name`, `npsn`, `address`, `logo_url` |

---

## Aturan Penting Alur Siswa

### 1. Siswa TIDAK memilih kelas sendiri

Kelas siswa selalu diambil dari `students.class_id`. Siswa tidak pernah diberikan opsi untuk memilih atau mengganti kelas.

### 2. Siswa TIDAK memilih jadwal sendiri

Jadwal yang tampil pada kartu ujian adalah jadwal yang terhubung dengan:
- `schedules.class_id` = kelas siswa
- `schedules.exam_id` = ujian aktif saat ini

Tidak ada filter atau pilihan jadwal dari sisi siswa.

### 3. Siswa TIDAK memilih jurusan sendiri

Jurusan berasal dari `classes.major` yang terhubung melalui `students.class_id`.

### 4. NISN sebagai satu-satunya identitas

Siswa hanya perlu memasukkan NISN. Tidak ada password, PIN, atau OTP.

### 5. Status Pending = tidak ada kartu

Jika `students.approval_status` bukan `'Approved'`, kartu ujian tidak ditampilkan dalam bentuk apapun — tidak ada preview, tidak ada download, tidak ada cetak.

---

## Kondisi Edge Case

| Kondisi | Penanganan |
|---|---|
| NISN tidak ditemukan | Tampilkan pesan error yang jelas |
| Tidak ada ujian aktif | Tampilkan informasi bahwa tidak ada ujian berlangsung |
| Tidak ada jadwal untuk kelas siswa | Tampilkan kartu tanpa jadwal, atau tampilkan pesan kosong |
| `exam_settings` tidak ditemukan | `TODO/NEEDS CONFIRMATION` — apakah pakai default atau error? |
| `exam_cards` belum dibuat untuk siswa ini | `TODO/NEEDS CONFIRMATION` — apakah dibuat otomatis atau harus dibuat TU? |

---

## Download PDF

- Dipicu saat siswa menekan tombol **Download**.
- Hanya aktif jika `allow_download = true` di `exam_settings`.
- Format output: **PDF**.
- Isi PDF mengikuti desain kartu ujian yang sudah disepakati.

## Cetak

- Dipicu saat siswa menekan tombol **Cetak**.
- Hanya aktif jika `allow_print = true` di `exam_settings`.
- Membuka dialog cetak browser.
- Ukuran dan layout cetak harus dapat disesuaikan dengan desain kartu yang sudah ada.
- Jangan mengubah konsep kartu hanya karena keterbatasan teknis cetak.
