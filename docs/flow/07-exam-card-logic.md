# 07 — Exam Card Logic

## Definisi Kartu Ujian

Kartu ujian adalah dokumen digital yang dihasilkan dari **gabungan data** beberapa tabel. Kartu ini berfungsi sebagai tanda pengenal resmi siswa selama periode ujian berlangsung.

---

## Sumber Data Kartu Ujian

```
Kartu Ujian
    ├── Data Siswa        ← students
    ├── Data Kelas        ← classes (via students.class_id)
    ├── Data Ujian        ← exams (is_active = true)
    ├── Jadwal Kelas      ← schedules (class_id + exam_id)
    ├── Pengaturan Kartu  ← exam_settings (exam_id)
    └── Profil Sekolah    ← school_profile (source of truth)
```

---

## Query Logic (Server-Side)

Berikut urutan query yang dijalankan di sisi server saat siswa meminta kartu ujian:

```sql
-- 1. Cari siswa berdasarkan NISN
SELECT * FROM students WHERE nisn = $nisn;

-- 2. Ambil data kelas
SELECT * FROM classes WHERE id = $student.class_id;

-- 3. Ambil ujian aktif
SELECT * FROM exams WHERE is_active = true LIMIT 1;

-- 4. Ambil jadwal untuk kelas siswa pada ujian aktif
SELECT * FROM schedules
WHERE exam_id = $exam.id
  AND class_id = $student.class_id
ORDER BY exam_date ASC, start_time ASC;

-- 5. Ambil pengaturan kartu
SELECT * FROM exam_settings WHERE exam_id = $exam.id;

-- 6. Ambil data kartu ujian siswa (jika sudah ada)
SELECT * FROM exam_cards
WHERE student_id = $student.id
  AND exam_id = $exam.id;

-- 7. Ambil profil sekolah
SELECT * FROM school_profile LIMIT 1;
```

---

## Komponen Isi Kartu Ujian

### Informasi Sekolah
Bersumber dari `school_profile`:

| Field | Tampil Jika |
|---|---|
| Nama Sekolah (`school_name`) | Selalu |
| NPSN (`npsn`) | Selalu |
| Alamat (`address`) | Selalu |
| Logo (`logo_url`) | `logo_url` tidak null |

### Judul Kartu
Bersumber dari `exam_settings.card_title`.

### Identitas Siswa
Bersumber dari `students` + `classes`:

| Field | Tampil Jika |
|---|---|
| Nama (`name`) | Selalu |
| NISN (`nisn`) | Selalu |
| Kelas (`class_name`) | Selalu |
| Tingkat (`grade`) | Selalu |
| Jurusan (`major`) | Selalu |
| Foto Siswa | `exam_settings.show_photo = true` |

### Informasi Ujian
Bersumber dari `exams`:

| Field | Tampil Jika |
|---|---|
| Nama Ujian (`name`) | Selalu |
| Tahun Ajaran (`academic_year`) | Selalu |
| Semester (`semester`) | Selalu |

### Jadwal Ujian
Bersumber dari `schedules` (filtered by `class_id` + `exam_id`):

| Field | Tampil Jika |
|---|---|
| Mata Pelajaran (`subject`) | `exam_settings.show_schedule = true` |
| Tanggal (`exam_date`) | `exam_settings.show_schedule = true` |
| Jam Mulai (`start_time`) | `exam_settings.show_schedule = true` |
| Jam Selesai (`end_time`) | `exam_settings.show_schedule = true` |
| Ruang (`room`) | `exam_settings.show_room = true` |

---

## Kondisi Tampil Kartu

```
students.approval_status
    ├── 'Pending'  → JANGAN tampilkan kartu ujian
    └── 'Approved' → Tampilkan kartu ujian lengkap
```

---

## Satu Siswa, Banyak Periode Ujian

Siswa dapat memiliki beberapa `exam_cards` dari periode berbeda:

```
exam_cards
├── student_id = 1, exam_id = 1  (PSAT Ganjil 2024/2025)
├── student_id = 1, exam_id = 2  (PSAS Ganjil 2024/2025)
├── student_id = 1, exam_id = 3  (PSAT Genap 2024/2025)
└── student_id = 1, exam_id = 4  (PSAS Genap 2024/2025)
```

- Kartu ujian lama **tidak otomatis dihapus**.
- Portal siswa menampilkan kartu berdasarkan **ujian aktif** (`is_active = true`).

---

## Download PDF

- Format: **PDF**.
- Isi mengikuti tampilan preview kartu ujian yang sudah dirender.
- Hanya aktif jika `exam_settings.allow_download = true`.
- Implementasi: `TODO/NEEDS CONFIRMATION` — library PDF yang digunakan (misalnya `jsPDF`, `react-pdf`, atau browser print-to-PDF).

## Cetak

- Menggunakan mekanisme print browser atau CSS `@media print`.
- Hanya aktif jika `exam_settings.allow_print = true`.
- Layout cetak harus mengikuti desain kartu yang sudah disepakati.
- **Jangan mengubah desain kartu** hanya karena keterbatasan implementasi cetak.

---

## Nomor Kartu (`card_number`)

- Tersimpan di `exam_cards.card_number`.
- Format penomoran: `TODO/NEEDS CONFIRMATION`.

## Status Kartu (`exam_cards.status`)

- Default: `'ACTIVE'`
- Nilai lain: `TODO/NEEDS CONFIRMATION`

---

## Catatan Penting

> ⚠️ **AGY dilarang mengubah logika relasi data ini** tanpa persetujuan eksplisit. Jika ada kebutuhan perubahan pada query atau relasi, STOP dan laporkan terlebih dahulu.

> ⚠️ Siswa **tidak pernah** memilih jadwal, kelas, atau jurusan. Semua diambil otomatis berdasarkan `students.class_id`.
