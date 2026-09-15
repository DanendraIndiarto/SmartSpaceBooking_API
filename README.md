# 🏢 Smart Space Booking API - UKK RPL Paket B

> **Backend RESTful API untuk Sistem Reservasi Coworking Space (Smart Space Booking)**  
> Dibuat untuk memenuhi tugas **Uji Kompetensi Keahlian (UKK) Rekayasa Perangkat Lunak (RPL) - Paket B**.

---

## 📋 Berkas Pengumpulan UKK
Sesuai dengan ketentuan berkas yang wajib dikumpulkan:

| No | Berkas | Lokasi dalam Repositori |
|:---|:---|:---|
| **1** | **Source Code Lengkap** | Seluruh struktur folder project (`src/`, `prisma/`, `package.json`, dll.) |
| **2** | **File Basis Data / Migrasi** | • File SQL: [`database/ukk_paket_b.sql`](./database/ukk_paket_b.sql)<br>• Migrasi Prisma: [`prisma/migrations/`](./prisma/migrations/) |
| **3** | **Dokumentasi API** | • Postman Collection: [`Smart_Space_Booking_API.postman_collection.json`](./Smart_Space_Booking_API.postman_collection.json)<br>• Swagger UI: `http://localhost:3000/api` |
| **4** | **Panduan Menjalankan Aplikasi** | Tertera lengkap di bawah ini pada bagian [Cara Menjalankan Aplikasi](#-cara-menjalankan-aplikasi). |

---

## 🛠️ Tech Stack & Dependencies
- **Framework**: [NestJS](https://nestjs.com/) (Express, TypeScript)
- **Database**: MySQL
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT (JSON Web Token) & Passport.js
- **API Documentation**: Swagger (OpenAPI 3.0) & Postman Collection
- **File Upload**: Multer (Static Assets di `/uploads`)

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Prasyarat Sistem
- **Node.js**: Versi 18.x atau lebih baru ([Unduh Node.js](https://nodejs.org/))
- **MySQL Database**: Melalui XAMPP / Laragon / MySQL Server

---

### 2. Konfigurasi Environment (`.env`)
Salin file template `.env.example` menjadi `.env`:
```bash
# Untuk Windows (Command Prompt / PowerShell):
copy .env.example .env

# Atau untuk Linux / MacOS:
cp .env.example .env
```

Pastikan isi `.env` sesuai dengan koneksi database MySQL Anda:
```env
DATABASE_URL="mysql://root:@localhost:3306/ukk_paket_b"
JWT_SECRET="super_secret_key_ukk_2026"
PORT=3000
```
> *Catatan: Buat database kosong bernama `ukk_paket_b` terlebih dahulu di MySQL/phpMyAdmin.*

---

### 3. Instalasi Dependency
Jalankan perintah berikut di terminal:
```bash
npm install
```

---

### 4. Setup Basis Data
Pilih salah satu cara berikut:

- **Opsi A (Menggunakan Prisma Migration - Disarankan):**
  ```bash
  npx prisma migrate deploy
  npx prisma generate
  ```
- **Opsi B (Import Manual SQL):**  
  Import file [`database/ukk_paket_b.sql`](./database/ukk_paket_b.sql) langsung ke database `ukk_paket_b` via phpMyAdmin atau MySQL CLI.

---

### 5. Menjalankan Server
```bash
# Mode Development (Auto-reload):
npm run start:dev

# Mode Production:
npm run build
npm run start:prod
```

---

## 🌐 Base URL & Dokumentasi API

- **Base URL API**: `http://localhost:3000`
- **Port Default**: `3000` (atau sesuai konfigurasi `PORT` di `.env`)
- **Swagger Interactive Docs**: [http://localhost:3000/api](http://localhost:3000/api)
- **Static File Uploads**: `http://localhost:3000/uploads/<nama_file>`

---

## 🔑 Header Khusus (Multi-Tenancy & Auth)

Untuk membedakan data antar siswa dan menjaga keamanan API:
1. **`x-maker-key`** (Header Wajib):
   - Didapatkan setelah mendaftar di endpoint `POST /maker/register`.
   - Wajib disertakan di header setiap request untuk isolasi data (`x-maker-key: <YOUR_APP_KEY>`).
2. **`Authorization`** (Bearer Token):
   - Didapatkan setelah login di endpoint `POST /auth/login`.
   - Format: `Bearer <jwt_token>`

---

## 📑 Ringkasan Endpoint Utama

### 1. Maker (Multi-Tenancy)
- `POST /maker/register` : Mendaftarkan identitas siswa & mendapatkan `app_key`

### 2. Autentikasi (`/auth`)
- `POST /auth/register` : Pendaftaran akun (`admin_space` atau `member`)
- `POST /auth/login` : Login user & penerbitan JWT token

### 3. Ruangan / Space (`/spaces`)
- `GET /spaces` : Daftar semua space
- `POST /spaces` : Tambah space baru (*Khusus Admin Space*)
- `GET /spaces/:id` : Detail space
- `PATCH /spaces/:id` : Update data space
- `DELETE /spaces/:id` : Hapus space

### 4. Diskon (`/diskon`)
- `GET /diskon` : Daftar diskon aktif
- `POST /diskon` : Tambah promo diskon baru
- `PATCH /diskon/:id` : Update diskon
- `DELETE /diskon/:id` : Hapus diskon

### 5. Reservasi (`/reservasi`)
- `POST /reservasi` : Booking space baru (*Member*)
- `GET /reservasi` : Riwayat reservasi
- `GET /reservasi/:id` : Detail reservasi
- `PATCH /reservasi/:id/status` : Update status booking (Setujui / Selesai / Batalkan)

### 6. File Upload (`/upload`)
- `POST /upload/foto` : Upload gambar space / foto profil member (multipart/form-data)

---

## 👨‍💻 Pengembang
- **Nama**: Danendra Athallah Indiarto
- **Kelas / Jurusan**: XII RPL 1
- **Repositori GitHub**: [https://github.com/DanendraIndiarto/SmartSpaceBooking_API](https://github.com/DanendraIndiarto/SmartSpaceBooking_API)
