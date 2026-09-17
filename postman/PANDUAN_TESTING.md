# 📮 Panduan Lengkap Pengujian API dengan Postman
**Smart Space Booking API - UKK RPL Paket B**

Berkas Postman ini disiapkan agar Anda dapat menguji seluruh **45 Endpoint API** secara langsung, mudah, dan otomatis tanpa perlu konfigurasi header tambahan seperti `x-maker-key`.

---

## 📂 Berkas di Dalam Folder Ini

1. **[`Smart_Space_Booking_API.postman_collection.json`](./Smart_Space_Booking_API.postman_collection.json)** (atau file di root project):
   - Koleksi lengkap **45 endpoint** yang dikelompokkan ke dalam 12 folder modul terstruktur.
   - Dilengkapi script otomatis (*Tests*) untuk menyimpan `admin_token` dan `member_token` ke variabel Postman saat registrasi atau login.
2. **[`Smart_Space_Booking.postman_environment.json`](./Smart_Space_Booking.postman_environment.json)**:
   - Variabel environment Postman (`base_url`, `admin_token`, `member_token`).

---

## 🚀 Cara Import ke Aplikasi Postman

1. Buka aplikasi **Postman**.
2. Klik tombol **Import** di kiri atas layar Postman.
3. Seret (*drag and drop*) kedua file JSON di atas ke dalam jendela Postman:
   - `Smart_Space_Booking_API.postman_collection.json`
   - `Smart_Space_Booking.postman_environment.json`
4. Di pojok kanan atas Postman, pilih environment aktif: **`Smart Space Booking (Localhost)`**.
5. Pastikan server backend Anda sudah berjalan:
   ```bash
   npm run start:dev
   ```

---

## 🔄 Urutan Pengujian yang Direkomendasikan

Jalankan request secara berurutan sesuai alur berikut agar pengujian berjalan mulus dan token terisi otomatis:

### Tahap 1: Root & Health Check Server
Buka folder **`1. Root & Health Check Service`**:
1. Jalankan `1. GET / - Status API & Petunjuk Penggunaan`
2. Jalankan `2. GET /health - Health Check Server`

---

### Tahap 2: Registrasi & Login Akun
Buka folder **`2. Autentikasi Pengguna (Member & Admin Space)`**:
1. Jalankan `3. POST /api/auth/register/member`
   - Membuat akun member baru (`johndoe`). Token tersimpan otomatis ke `{{member_token}}`.
2. Jalankan `4. POST /api/auth/register/admin-space`
   - Membuat akun admin space (`admin_space1`). Token tersimpan otomatis ke `{{admin_token}}`.
3. Jalankan `5. POST /api/auth/login`:
   - Jika login dengan akun Admin Space -> otomatis memperbarui `{{admin_token}}`.
   - Jika login dengan akun Member -> otomatis memperbarui `{{member_token}}`.
4. Jalankan `6. GET /api/auth/profile` untuk memastikan token autentikasi valid.

---

### Tahap 3: Kelola Master Data oleh Admin Coworking
1. **Folder `6. Profil Lokasi Coworking Space (Panel Admin)`**:
   - Jalankan `20. GET /api/admin/profile` & `21. PUT /api/admin/profile`.
2. **Folder `8. Manajemen Space Ruangan & Meja (Panel Admin)`**:
   - Jalankan `28. POST /api/admin/spaces` untuk menambah meja/ruangan baru.
   - Jalankan `27. GET /api/admin/spaces` untuk melihat daftar semua space.
   - Jalankan `29. GET /api/admin/spaces/{id}`, `30. PUT /api/admin/spaces/{id}`, atau `31. DELETE /api/admin/spaces/{id}`.
3. **Folder `9. Manajemen Kode Promo & Diskon (Panel Admin)`**:
   - Jalankan `33. POST /api/admin/diskon` untuk membuat promo baru.
   - Jalankan `32. GET /api/admin/diskon` untuk melihat daftar semua diskon.
4. **Folder `7. Manajemen Member / Pelanggan (Panel Admin)`**:
   - Jalankan `22. GET /api/admin/members` dan `23. POST /api/admin/members`.

---

### Tahap 4: Eksplorasi Katalog & Reservasi oleh Member
1. **Folder `3. Space Coworking (Katalog & Ketersediaan)`**:
   - Jalankan `7. GET /api/spaces/types` (Lihat tipe-tipe space).
   - Jalankan `8. GET /api/spaces/availability` (Cek apakah ruangan kosong pada jam tertentu).
   - Jalankan `9. GET /api/spaces` (Katalog space publik).
   - Jalankan `10. GET /api/spaces/{id}` (Detail space).
2. **Folder `4. Diskon & Promo (Katalog Diskon)`**:
   - Jalankan `11. GET /api/diskon/active` (Promo aktif).
   - Jalankan `12. POST /api/diskon/check` (Cek validitas kode promo).
3. **Folder `5. Reservasi Member (Pemesanan & Histori)`**:
   - Jalankan `14. POST /api/reservasi` (Pesan space meja/ruangan).
   - Jalankan `15. GET /api/reservasi/my` (Lihat pesanan aktif milik sendiri).
   - Jalankan `16. GET /api/reservasi/my/history` (Histori bulanan pengeluaran & booking).
   - Jalankan `17. GET /api/reservasi/{id}/e-ticket` (Cetak bukti E-Ticket digital).
   - Jalankan `18. GET /api/reservasi/{id}` & `19. PATCH /api/reservasi/{id}/cancel`.

---

### Tahap 5: Operasional & Laporan Coworking (Admin Space)
1. **Folder `10. Transaksi Reservasi & Check-In/Check-Out (Panel Admin)`**:
   - Jalankan `37. GET /api/admin/reservasi` (Melihat seluruh data reservasi yang masuk).
   - Jalankan `38. PATCH /api/admin/reservasi/{id}/status` (Konfirmasi status pesanan: `disetujui`).
   - Jalankan `39. POST /api/admin/reservasi/{id}/check-in` (Pelanggan tiba, status berubah ke `aktif`).
   - Jalankan `40. POST /api/admin/reservasi/{id}/check-out` (Selesai menggunakan fasilitas, status `selesai`).
2. **Folder `11. Rekapitulasi Laporan Pendapatan Bulanan (Panel Admin)`**:
   - Jalankan `41. GET /api/admin/reports/monthly` (Laporan omset kotor, potongan diskon, dan realisasi pendapatan bersih).
   - Jalankan `42. GET /api/admin/reports/income` (Alias rekapitulasi pendapatan).

---

### Tahap 6: Upload Media (Foto Ruangan & Profil)
Buka folder **`12. Upload Berkas & Gambar (Media)`**:
- Jalankan `43. POST /api/upload/image` (Upload gambar umum).
- Jalankan `44. POST /api/upload/spaces` (Upload foto space coworking).
- Jalankan `45. POST /api/upload/members` (Upload foto profil member).
*(Pada tab Body -> form-data, pilih key `file` dengan tipe File dan pilih gambar dari komputer Anda).*
