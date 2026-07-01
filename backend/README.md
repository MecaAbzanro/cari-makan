# CariMakan — Backend API

REST API untuk aplikasi CariMakan, dibangun dengan Express.js + MongoDB (Mongoose).

> Dokumentasi arsitektur lengkap, alur data, dan daftar seluruh endpoint ada di
> `README.md` pada folder root proyek (`../README.md`). Dokumen ini fokus ke hal-hal
> teknis spesifik backend saja.

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose (ODM)
- JWT (`jsonwebtoken`) untuk autentikasi
- `bcryptjs` untuk hash password
- `express-async-handler` agar tidak perlu try/catch manual di tiap controller
- `morgan` untuk request logging saat development

## Instalasi

```bash
npm install
cp .env.example .env
```

Isi `MONGO_URI` di `.env` (lihat opsi MongoDB lokal/Atlas di README root), lalu:

```bash
npm run seed   # opsional: isi database dengan 6 restoran contoh + akun demo
npm run dev    # jalankan server dengan auto-restart (node --watch)
```

Server berjalan di `http://localhost:5000`. Cek `GET /api/health` untuk memastikan server hidup.

## Pola Arsitektur (MVC)

```
Request → Route → Middleware (protect, dll) → Controller → Model (Mongoose) → MongoDB
```

- **`models/`** — skema data & validasi tingkat database, plus logika yang melekat erat ke data
  (mis. `Review.calculateAverageRating()`, `User.comparePassword()`).
- **`controllers/`** — logika bisnis tiap endpoint. Selalu dibungkus `asyncHandler` supaya error
  async otomatis diteruskan ke `errorHandler` tanpa try/catch berulang.
- **`routes/`** — hanya pemetaan URL → controller + middleware mana yang dipakai. Tidak ada logika
  bisnis di sini.
- **`middleware/auth.js`** — `protect` (wajib login) dan `adminOnly` (role-based, **belum dipakai**
  di routes manapun saat ini — lihat catatan di README root soal admin sederhana).
- **`middleware/errorHandler.js`** — satu tempat untuk merapikan semua jenis error (validasi
  Mongoose, ID tidak valid, duplicate key, dll) jadi response JSON konsisten.

## Menambah Endpoint Baru

Contoh: menambah fitur "laporkan restoran" (`POST /api/restaurants/:id/report`).

1. Tambah field/koleksi baru di `models/` kalau perlu.
2. Tulis fungsi di `controllers/restaurantController.js`, contoh:
   ```js
   export const reportRestaurant = asyncHandler(async (req, res) => {
     // ...logika...
     res.status(201).json({ success: true, message: 'Laporan terkirim' })
   })
   ```
3. Daftarkan di `routes/restaurantRoutes.js`:
   ```js
   router.post('/:id/report', protect, reportRestaurant)
   ```
4. Update tabel endpoint di README root supaya frontend developer tahu kontrak API-nya.

## Seeding Data

```bash
npm run seed           # isi database (akan menghapus data lama dulu)
npm run seed:destroy   # hanya hapus semua data, tanpa mengisi ulang
```

Data seed berisi **50 restoran** tersebar di sekitar Politeknik Negeri Lampung (Rajabasa,
Kedaton, Sukarame, Labuhan Ratu, Tanjung Karang, Way Halim, Teluk Betung), mencakup 13 kategori
masakan (Padang, Jawa, Sunda, Chinese, Western, Seafood, Minuman, Bakso & Mie, Sate, Ayam,
Sehat & Diet, Pizza, Dessert) dengan total 255 menu item — plus satu akun demo:
`demo@carimakan.com` / `password123`.

Foto memakai [picsum.photos](https://picsum.photos) dengan parameter `seed` per
restoran/menu, sehingga gambar stabil (tidak berubah tiap kali seed dijalankan ulang) tanpa
perlu API key. **Unsplash Source sengaja tidak dipakai** karena layanan tersebut sudah resmi
dihentikan sejak 2021 dan dalam proses dimatikan total — pakai picsum.photos atau Unsplash API
resmi (butuh API key) untuk kebutuhan serupa di proyek lain.

Setiap restoran juga punya koordinat (`location.lat`/`location.lng`) yang tersebar secara
deterministik di sekitar kampus, dipakai untuk fitur sort "Terdekat" di pencarian.


## Testing Manual Cepat (tanpa frontend)

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"password123"}'

# Login (simpan token dari response)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@carimakan.com","password":"password123"}'

# Akses endpoint yang butuh login
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token_dari_login>"
```
