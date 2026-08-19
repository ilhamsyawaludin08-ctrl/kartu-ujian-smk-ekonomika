# 08 — UI/UX Context

## Identitas Visual

Desain aplikasi mengikuti identitas visual **SMK Ekonomika**.

| Aspek | Keputusan |
|---|---|
| **Warna Dominan** | Ungu (sesuai identitas SMK Ekonomika) |
| **Gaya** | Modern, Profesional, Clean, Elegan |
| **Kepadatan** | Tidak terlalu ramai / Minimalist |
| **Target Feel** | Premium, Terpercaya, Institusional |

---

## Prinsip Desain

### 1. Konsistensi
Seluruh halaman menggunakan komponen, warna, dan tipografi yang konsisten. Jangan membuat style ad-hoc di luar sistem desain yang sudah ada.

### 2. Hierarki Visual yang Jelas
Informasi penting harus mudah ditemukan. Gunakan ukuran, bobot font, dan kontras warna untuk membedakan elemen penting dan pendukung.

### 3. Responsif
Aplikasi harus dapat digunakan dengan baik di desktop dan mobile. Kartu ujian terutama harus dapat dilihat dengan nyaman di layar kecil.

### 4. Aksesibilitas
- Kontras warna yang memadai.
- Label pada semua input form.
- Pesan error yang jelas dan deskriptif.

---

## Hal yang Boleh Diperbaiki AGY

AGY boleh melakukan perbaikan pada:

- ✅ Spacing dan padding yang tidak konsisten.
- ✅ Tipografi (ukuran, berat, line-height).
- ✅ Responsiveness di berbagai ukuran layar.
- ✅ Aksesibilitas (aria-label, contrast, focus state).
- ✅ UX yang terasa kurang nyaman (misal: feedback loading, error state).
- ✅ Konsistensi komponen (button, input, card).

---

## Hal yang TIDAK Boleh Diubah AGY

AGY **dilarang** mengubah:

- ❌ Warna dominan (ungu) menjadi warna lain tanpa alasan yang jelas.
- ❌ Gaya desain keseluruhan (modern → flat/lainnya).
- ❌ Konsep layout halaman yang sudah ada.
- ❌ Desain kartu ujian yang sudah disepakati.

> Jika ada alasan kuat untuk perubahan besar desain, **STOP dan diskusikan terlebih dahulu**.

---

## Komponen UI Utama

### Landing Page

- Dua pilihan akses yang jelas: **Siswa** dan **TU/Guru**.
- Visual yang menarik dan merepresentasikan identitas sekolah.
- Tidak perlu registrasi untuk siswa.

### Halaman Siswa

- Form input NISN yang sederhana dan bersih.
- Feedback loading saat pencarian.
- Pesan error yang ramah jika NISN tidak ditemukan.
- Preview kartu ujian yang rapi setelah data ditemukan.
- Tombol Download dan Cetak yang mudah ditemukan.

### Halaman Login TU

- Form login email + password.
- Feedback error jika login gagal.
- Tampilan bersih, tidak berlebihan.

### Dashboard TU

- Navigasi sidebar atau top navigation yang jelas.
- Ringkasan data (card statistik).
- Mudah berpindah antar modul.

### Halaman Data (Tabel)

- Tabel data yang bersih dan mudah dibaca.
- Fitur pencarian/filter yang mudah diakses.
- Tombol aksi (tambah, edit, hapus) yang konsisten.
- Empty state yang informatif.
- Konfirmasi sebelum melakukan operasi DELETE.

### Halaman Form (Tambah/Edit)

- Label input yang jelas.
- Validasi real-time jika memungkinkan.
- Feedback sukses/error setelah submit.
- Tombol submit dan batal yang jelas.

### Kartu Ujian (Preview)

- Tampilan sesuai desain kartu yang sudah disepakati.
- Informasi sekolah di bagian atas (logo + nama).
- Identitas siswa yang jelas.
- Tabel jadwal yang rapi.
- Sertakan pernyataan/keterangan resmi jika ada.

---

## Tipografi

> `TODO/NEEDS CONFIRMATION` — Font family yang digunakan (Google Fonts atau custom).

Rekomendasi umum:
- Heading: Font yang tegas dan mudah dibaca.
- Body: Font yang nyaman untuk teks panjang.
- Monospace: Untuk NISN atau nomor kartu jika perlu.

---

## Warna Sistem

> `TODO/NEEDS CONFIRMATION` — Palet warna eksak (hex/HSL) yang sudah disepakati.

Diketahui:
- Warna dominan: **Ungu** (sesuai identitas SMK Ekonomika).
- Harus memiliki variasi shade untuk hover, active, disabled.
- Harus memiliki warna semantic: success, warning, error, info.

---

## State UI yang Harus Ditangani

| State | Deskripsi |
|---|---|
| **Loading** | Saat data sedang diambil dari server |
| **Empty** | Saat tidak ada data untuk ditampilkan |
| **Error** | Saat terjadi kesalahan (network, not found, dll.) |
| **Success** | Saat operasi berhasil |
| **Pending** | Kartu tidak dapat ditampilkan karena approval belum selesai |

---

## Print & PDF

- Layout kartu untuk cetak menggunakan CSS `@media print`.
- Pastikan warna background tetap muncul saat dicetak (jika relevan).
- Margin cetak harus tepat agar tidak terpotong.
- Ukuran kertas yang ditarget: `TODO/NEEDS CONFIRMATION` (A4, A5, atau ukuran kartu khusus?).
