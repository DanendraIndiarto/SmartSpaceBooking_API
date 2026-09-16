# 📮 Panduan Lengkap Pengujian API dengan Postman
**Smart Space Booking API - UKK RPL Paket B**

Folder ini berisi seluruh berkas yang Anda butuhkan untuk menguji seluruh **50 Endpoint API** secara otomatis dan terstruktur.

---

## 📂 Berkas di Dalam Folder Ini

1. **[`Smart_Space_Booking_API.postman_collection.json`](./Smart_Space_Booking_API.postman_collection.json)**:
   - Koleksi lengkap 50 endpoint yang dikelompokkan ke dalam 13 modul.
   - Dilengkapi script otomatis (*Tests*) untuk menyimpan `maker_key`, `admin_token`, dan `member_token` ke variabel Postman.
2. **[`Smart_Space_Booking.postman_environment.json`](./Smart_Space_Booking.postman_environment.json)**:
   - Variabel environment Postman (`base_url`, `maker_key`, `admin_token`, `member_token`).

---

## 🚀 Cara Import ke Aplikasi Postman

1. Buka aplikasi **Postman**.
2. Klik tombol **Import** di kiri atas layar Postman.
3. Seret (*drag and drop*) kedua file JSON di atas ke dalam jendela Postman:
   - `Smart_Space_Booking_API.postman_collection.json`
   - `Smart_Space_Booking.postman_environment.json`
4. Di pojok kanan atas Postman, pilih environment aktif: **`Smart Space Booking (Localhost)`**.

---

## 🔄 Urutan Pengujian yang Direkomendasikan

Jalankan request secara berurutan sesuai alur berikut agar pengujian berjalan mulus tanpa error autentikasi:

### Tahap 1: Persiapan & Identitas Siswa
1. Pastikan server backend sedang aktif:
   ```bash
   npm run start:dev
   ```
2. Buka folder **`1. Root & Health Check Service`**:
   - Jalankan `1. GET /` dan `2. GET /health`.
3. Buka folder **`2. Multi-Tenancy Siswa (App Maker)`**:
   - Jalankan `3. POST /api/maker/register`.
   - *Maker Key* baru akan dibuat dan langsung otomatis tersimpan ke variabel `{{maker_key}}`.

---

### Tahap 2: Registrasi & Login Akun
Buka folder **`3. Autentikasi Pengguna (Member & Admin Space)`**:
1. Jalankan `8. POST /api/auth/register/member` (Membuat akun member).
2. Jalankan `9. POST /api/auth/register/admin-space` (Membuat akun admin space).
3. Jalankan `10. POST /api/auth/login`:
   - Login sebagai **Admin Space** (Username: `admin_space1`, Password: `Admin123!`) -> otomatis menyimpan `{{admin_token}}`.
   - Login sebagai **Member** (Username: `johndoe`, Password: `Secret123!`) -> otomatis menyimpan `{{member_token}}`.
4. Jalankan `11. GET /api/auth/profile` untuk memastikan token bekerja.

---

### Tahap 3: Kelola Data Master (Admin Space)
1. **Folder `9. Manajemen Space Ruangan & Meja`**:
   - Jalankan `33. POST /api/admin/spaces` untuk menambah meja/ruangan.
   - Jalankan `32. GET /api/admin/spaces` untuk melihat daftar ruangan yang dibuat.
2. **Folder `10. Manajemen Kode Promo & Diskon`**:
   - Jalankan `38. POST /api/admin/diskon` untuk membuat promo (misal: diskon 20%).
3. **Folder `7. Profil Lokasi Coworking Space`**:
   - Jalankan `25. GET /api/admin/profile` & `26. PUT /api/admin/profile`.

---

### Tahap 4: Eksplorasi & Reservasi (Member)
1. **Folder `4. Space Coworking (Katalog & Ketersediaan)`**:
   - Jalankan `14. GET /api/spaces` dan `13. GET /api/spaces/availability`.
2. **Folder `5. Diskon & Promo`**:
   - Jalankan `16. GET /api/diskon/active` dan `17. POST /api/diskon/check`.
3. **Folder `6. Reservasi Member`**:
   - Jalankan `19. POST /api/reservasi` (Pemesanan space oleh member).
   - Jalankan `20. GET /api/reservasi/my` (Melihat status pesanan).

---

### Tahap 5: Operasional & Laporan (Admin Space)
1. **Folder `11. Manajemen & Operasional Reservasi`**:
   - Jalankan `42. GET /api/admin/reservasi` (Melihat pesanan masuk).
   - Jalankan `43. PATCH /api/admin/reservasi/{id}/status` (Setujui pesanan / approve).
   - Jalankan `44. POST /api/admin/reservasi/{id}/check-in` (Check-in pelanggan).
   - Jalankan `45. POST /api/admin/reservasi/{id}/check-out` (Check-out pelanggan).
2. **Folder `12. Rekapitulasi Laporan Pendapatan Bulanan`**:
   - Jalankan `46. GET /api/admin/reports/monthly` (Laporan estimasi & realisasi pendapatan).

---

### Tahap 6: Upload Media (File Upload)
Buka folder **`13. Upload Berkas & Gambar (Media)`**:
- Jalankan `48. POST /api/upload/image`, `49. POST /api/upload/spaces`, atau `50. POST /api/upload/members`.
- Pilih gambar di tab *Body* -> *form-data* (*file*).
