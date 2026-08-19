# 12 — Agent Rules (Aturan untuk AGY)

## Tujuan Dokumen

Dokumen ini berisi aturan wajib yang **harus dibaca dan diikuti** oleh AI coding agent (AGY/Antigravity) sebelum mengimplementasikan fitur apapun pada project **Kartu Ujian SMK Ekonomika**.

---

## 🔴 WAJIB DILAKUKAN

### Sebelum Mulai Implementasi
- [ ] Baca seluruh dokumentasi di folder `docs/` terlebih dahulu.
- [ ] Pahami konsep aplikasi, flow bisnis, dan struktur database.
- [ ] Pahami batasan akses setiap pengguna (siswa vs TU).
- [ ] Konfirmasi scope fitur sebelum mulai coding.

### Selama Implementasi
- [ ] Gunakan **TypeScript** untuk semua file.
- [ ] Gunakan **Next.js App Router** (bukan Pages Router).
- [ ] Gunakan Supabase client yang sudah dikonfigurasi di `src/lib/supabase/`.
- [ ] Lakukan perubahan secara **bertahap** — satu fitur per satu.
- [ ] Jelaskan perubahan besar **sebelum** melakukan perubahan yang berisiko.
- [ ] Pertahankan **konsistensi desain** dengan identitas visual yang sudah ada.
- [ ] Pertahankan **flow NISN** siswa — jangan tambahkan cara akses lain.
- [ ] Pertahankan **relasi database** yang sudah ada.

### Setelah Implementasi
- [ ] Pastikan tidak ada TypeScript error (`tsc --noEmit`).
- [ ] Pastikan tidak ada import atau variable yang tidak digunakan.
- [ ] Laporkan file apa saja yang dibuat/diubah.

---

## 🔴 DILARANG DILAKUKAN

### Database
- ❌ **Jangan membuat tabel baru** tanpa persetujuan eksplisit.
- ❌ **Jangan menghapus tabel** apapun.
- ❌ **Jangan menghapus kolom** apapun.
- ❌ **Jangan mengubah tipe data kolom** yang sudah ada.
- ❌ **Jangan mengubah foreign key** tanpa persetujuan.
- ❌ **Jangan mengubah RLS policy** tanpa persetujuan.
- ❌ **Jangan menghapus data** yang sudah ada.

### Akses & Keamanan
- ❌ **Jangan membuat policy `anon`** yang memberikan akses bebas ke tabel.
- ❌ **Jangan menaruh `service_role` key** di client, browser, atau `NEXT_PUBLIC_*`.
- ❌ **Jangan meng-commit credential** ke Git.
- ❌ **Jangan membuat endpoint publik** yang mengembalikan seluruh data siswa tanpa filter.

### Logika Bisnis Siswa
- ❌ **Jangan membuat siswa memilih kelas sendiri** — kelas dari `students.class_id`.
- ❌ **Jangan membuat siswa memilih jadwal sendiri** — jadwal otomatis dari kelas.
- ❌ **Jangan membuat siswa memilih jurusan sendiri** — jurusan dari `classes.major`.
- ❌ **Jangan menampilkan kartu ujian** jika `approval_status != 'Approved'`.

### Stack & Arsitektur
- ❌ **Jangan mengganti stack ke Python** atau framework lain.
- ❌ **Jangan mengganti database** (MySQL, MongoDB, dll.).
- ❌ **Jangan menggunakan Pages Router** — harus App Router.
- ❌ **Jangan install library baru** yang tidak dikonfirmasi tanpa izin.

### Desain
- ❌ **Jangan mengubah warna dominan** (ungu) tanpa alasan yang jelas.
- ❌ **Jangan mengganti konsep desain** keseluruhan.
- ❌ **Jangan mengubah desain kartu ujian** yang sudah disepakati.

### Scope
- ❌ **Jangan membuat fitur di luar scope** hanya karena dianggap bagus.
- ❌ **Jangan membuat konsep bisnis baru** yang belum disepakati.

---

## 🟡 STOP DAN LAPORKAN JIKA

Hentikan implementasi dan laporkan kepada pemilik project jika:

1. **Kebutuhan perubahan database ditemukan** — tabel baru, kolom baru, atau perubahan relasi diperlukan.
2. **Requirement tidak jelas** — ada bagian yang ambigu atau bertentangan dalam dokumentasi.
3. **Terdapat item `TODO/NEEDS CONFIRMATION`** yang relevan dengan fitur yang sedang diimplementasikan.
4. **Ada konflik antara dokumentasi dan kode yang sudah ada**.
5. **Ada risiko keamanan** yang teridentifikasi selama implementasi.
6. **Library baru diperlukan** yang tidak ada dalam daftar yang sudah dikonfirmasi.

---

## 📄 Referensi Dokumen Wajib

Baca dokumen berikut sebelum mengimplementasikan fitur terkait:

| Sebelum Implementasi | Baca Dokumen |
|---|---|
| Fitur apapun | `01-project-overview.md`, `12-agent-rules.md` |
| Fitur siswa (NISN, kartu) | `04-student-flow.md`, `07-exam-card-logic.md` |
| Fitur TU (dashboard, CRUD) | `05-tu-flow.md`, `03-user-roles.md` |
| Halaman baru | `09-page-specification.md` |
| Query database | `06-database-context.md` |
| Komponen UI | `08-ui-ux-context.md` |
| Auth / proteksi route | `11-security-and-access.md` |
| Package / library baru | `10-technical-stack.md` |

---

## 📋 Checklist Sebelum PR / Submit

- [ ] TypeScript check lulus (`tsc --noEmit`).
- [ ] Tidak ada `console.log` yang tertinggal di production code.
- [ ] Tidak ada credential atau key yang ter-hardcode di source code.
- [ ] Semua route TU terlindungi (redirect ke `/login` jika tidak ada session).
- [ ] Logika siswa: kelas, jadwal, jurusan tidak dipilih oleh siswa.
- [ ] Kartu ujian tidak ditampilkan jika status Pending.
- [ ] `.env.local` tidak di-commit.
- [ ] File yang dibuat/diubah sudah dilaporkan kepada pemilik project.

---

## 💡 Catatan Format TODO

Jika menemukan bagian yang belum dikonfirmasi dalam dokumentasi, tandai dengan:

```
TODO/NEEDS CONFIRMATION — [deskripsi apa yang perlu dikonfirmasi]
```

Jangan mengarang atau mengasumsikan nilai untuk bagian yang belum dikonfirmasi.
