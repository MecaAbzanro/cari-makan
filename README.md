# CariMakan 🍜

Platform pencarian & pemesanan makanan (mirip GoFood/ShopeeFood) — dibangun dengan **MERN Stack**
(MongoDB, Express.js, React, Node.js). Pengguna dapat mencari restoran, melihat menu, membaca &
menulis review, menyimpan favorit, dan melakukan pemesanan.

```
cari-makan/
├── backend/     ← API server (Express + MongoDB)
├── frontend/    ← Aplikasi web (React + Vite + Tailwind)
└── README.md    ← Dokumen ini
```

---

## 1. Penjelasan Arsitektur & Alur Aplikasi

### Arsitektur keseluruhan

```
┌─────────────┐         HTTP (REST API)        ┌──────────────┐        Mongoose        ┌───────────┐
│   Frontend   │ ──────────────────────────────▶│   Backend    │ ───────────────────────▶│  MongoDB  │
│  (React/Vite)│ ◀──────────────────────────────│ (Express.js) │ ◀───────────────────────│           │
└─────────────┘          JSON response          └──────────────┘      Dokumen/Query       └───────────┘
```

- **Frontend** tidak pernah bicara langsung ke MongoDB. Semua permintaan data lewat **REST API**
  yang disediakan backend (`http://localhost:5000/api/...`).
- **Backend** menjalankan validasi, autentikasi (JWT), dan business logic, lalu berbicara ke
  MongoDB lewat **Mongoose** (ODM/Object Document Mapper).
- **MongoDB** menyimpan data sebagai dokumen (mirip JSON): `users`, `restaurants`, `menuitems`,
  `reviews`, `orders`.

### Alur data: Frontend → Backend → MongoDB (contoh: mencari restoran)

1. User mengetik "seafood" di kotak pencarian halaman `/cari` → React menyimpan ini di state lokal.
2. Saat user berhenti mengetik, frontend memanggil `GET /api/restaurants?q=seafood` lewat **axios**
   (`src/api/restaurantApi.js`).
3. Request masuk ke Express, melewati route `restaurantRoutes.js`, masuk ke
   `restaurantController.getRestaurants`.
4. Controller membangun query Mongoose `Restaurant.find({ $text: { $search: 'seafood' } })`.
5. Mongoose menerjemahkan ini jadi query MongoDB sungguhan, MongoDB mengembalikan dokumen yang cocok.
6. Controller membungkus hasil jadi `{ success: true, data: [...] }` dan mengirim balik sebagai JSON.
7. Frontend menerima response, menyimpannya di `useState`, lalu React me-render ulang
   `<RestaurantCard />` untuk tiap hasil.

### Alur Login/Register

1. User mengisi form di `/login` atau `/register` → submit ke `AuthContext.login()`/`register()`.
2. Frontend POST ke `/api/auth/login` (email + password).
3. Backend (`authController.login`) mencari user di MongoDB, membandingkan password yang diketik
   dengan hash tersimpan lewat `bcrypt.compare()`.
4. Kalau cocok, backend membuat **JWT** (`generateToken.js`) berisi `{ id: user._id }`, dikirim balik
   ke frontend bersama data user (tanpa password).
5. Frontend menyimpan token di `localStorage` dan menempelkannya otomatis ke header
   `Authorization: Bearer <token>` di setiap request berikutnya (lewat axios interceptor di
   `src/api/client.js`).
6. Untuk endpoint yang butuh login (review, favorite, order, admin), backend memvalidasi token ini
   lewat middleware `protect` sebelum mengizinkan akses.

### Pola akses (mirip GoFood)

| Fitur | Perlu login? |
|---|---|
| Lihat daftar & detail restoran | ❌ Tidak |
| Cari & filter restoran | ❌ Tidak |
| Lihat menu & review | ❌ Tidak |
| Menambah ke favorit | ✅ Ya |
| Menulis review | ✅ Ya |
| Checkout / membuat pesanan | ✅ Ya |
| Kelola restoran & menu (`/admin`) | ✅ Ya (role: admin) |

> **Catatan tentang halaman Admin:** halaman `/admin` hanya bisa diakses oleh user dengan `role: 'admin'`.
> Model `User` sudah punya field `role` (`user`/`admin`) dan middleware `adminOnly` sudah tersedia
> di `backend/src/middleware/auth.js`.

### Struktur folder Backend

```
backend/src/
├── config/db.js          → koneksi ke MongoDB lewat Mongoose
├── models/                → skema data (User, Restaurant, MenuItem, Review, Order)
├── controllers/            → logika bisnis tiap fitur (terpisah dari routing)
├── routes/                 → pemetaan URL endpoint ke fungsi controller
├── middleware/
│   ├── auth.js             → verifikasi JWT (protect) & cek role (adminOnly)
│   └── errorHandler.js     → menangkap semua error jadi response JSON yang rapi
├── utils/generateToken.js  → helper membuat JWT
├── data/seed.js            → skrip mengisi database dengan data contoh (50 restoran)
└── server.js                → entry point, merangkai semua middleware & route
```

**Pola MVC yang dipakai:** Model (skema Mongoose) → Controller (logika) → Route (pemetaan URL).
Tidak ada "View" karena backend ini API murni (JSON), tampilan ada di frontend.

### Struktur folder Frontend

```
frontend/src/
├── api/             → satu file per resource, semua panggilan axios ke backend
├── components/       → komponen reusable (Header, Footer, RestaurantCard, dst.)
├── context/           → state global: AuthContext (login/user) & CartContext (keranjang)
├── pages/              → satu file per halaman/route
│   └── admin/           → halaman khusus kelola restoran & menu
└── utils/format.js     → fungsi format angka jadi Rupiah, dll
```

**Kenapa Context API + useReducer (bukan Redux Toolkit)?** Untuk skala aplikasi ini (2 area state
global: auth & cart), `useReducer` + Context API sudah cukup terstruktur tanpa menambah dependency
tambahan. Polanya sama persis dengan Redux (action → reducer → state baru), jadi mudah di-upgrade
ke Redux Toolkit nanti kalau aplikasi berkembang lebih kompleks.

---

## 2. Panduan Instalasi Lengkap

### Prasyarat

- [Node.js](https://nodejs.org/) versi 18 ke atas
- Salah satu dari:
  - **MongoDB lokal** terinstal di komputer kamu, ATAU
  - Akun **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)** (gratis, cloud)

### Opsi A — MongoDB Lokal

1. Install MongoDB Community Edition sesuai OS kamu: [panduan resmi](https://www.mongodb.com/docs/manual/administration/install-community/).
2. Jalankan service MongoDB:
   - **Windows**: biasanya otomatis berjalan sebagai service setelah instalasi, atau jalankan `mongod` dari Command Prompt.
   - **macOS** (lewat Homebrew): `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`
3. Database akan otomatis dibuat saat backend pertama kali konek, tidak perlu membuat manual.
4. Connection string yang dipakai: `mongodb://127.0.0.1:27017/carimakan`

### Opsi B — MongoDB Atlas (Cloud)

1. Buat akun gratis di [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register).
2. Buat **cluster** baru (pilih tier gratis "M0").
3. Di menu **Database Access**, buat user database baru (catat username & password).
4. Di menu **Network Access**, klik "Add IP Address" → pilih "Allow Access from Anywhere" (`0.0.0.0/0`)
   supaya mudah untuk development (untuk production, batasi ke IP server kamu).
5. Di halaman cluster, klik **Connect → Drivers**, salin connection string yang formatnya:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/carimakan?retryWrites=true&w=majority
   ```
6. Ganti `<username>` dan `<password>` dengan kredensial yang kamu buat di langkah 3.

### Instalasi Backend

```bash
cd backend
npm install
cp .env.example .env
```

Buka file `.env` yang baru dibuat, isi `MONGO_URI` sesuai pilihan kamu (lokal atau Atlas dari
langkah di atas), dan ganti `JWT_SECRET` dengan string acak yang panjang (bisa pakai
`openssl rand -base64 32` di terminal untuk generate string acak).

```bash
# (Opsional tapi disarankan) isi database dengan data contoh (50 restoran)
npm run seed

# Jalankan server development (auto-restart saat file berubah)
npm run dev
```

Backend akan jalan di **http://localhost:5000**. Cek dengan membuka
`http://localhost:5000/api/health` di browser — harus muncul pesan sukses.

### Instalasi Frontend

Buka terminal baru (biarkan backend tetap jalan di terminal sebelumnya):

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend akan jalan di **http://localhost:5173** atau **http://localhost:5174**. Buka URL ini di browser.

### Menjalankan Keduanya Sekaligus (Concurrent)

Opsi 1 — dua terminal terpisah (paling sederhana, seperti di atas).

Opsi 2 — satu perintah dari folder root `cari-makan/` pakai `concurrently`:

```bash
# Dari folder cari-makan/ (root)
npm install concurrently --save-dev
npx concurrently -n backend,frontend -c blue,green "npm run dev --prefix backend" "npm run dev --prefix frontend"
```

### Environment Variables

**`backend/.env`**

| Variabel | Keterangan |
|---|---|
| `PORT` | Port server backend (default `5000`) |
| `NODE_ENV` | `development` atau `production` |
| `MONGO_URI` | Connection string MongoDB (lokal atau Atlas) |
| `JWT_SECRET` | String rahasia untuk menandatangani token JWT — **jangan dibagikan** |
| `JWT_EXPIRES_IN` | Masa berlaku token, mis. `30d` (30 hari) |
| `CLIENT_URL` | URL frontend, dipakai untuk referensi CORS saat deploy |

**`frontend/.env`**

| Variabel | Keterangan |
|---|---|
| `VITE_API_URL` | URL dasar API backend, mis. `http://localhost:5000/api` |

---

## 3. Backend — Ringkasan Endpoint API

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/auth/register` | Publik | Daftar akun baru |
| POST | `/auth/login` | Publik | Masuk, menerima JWT |
| GET | `/auth/me` | Login | Profil user yang sedang login |
| GET | `/restaurants` | Publik | List restoran (`?q=&category=&priceLevel=&minRating=&sort=&lat=&lng=`) |
| GET | `/restaurants/categories` | Publik | Daftar kategori unik |
| GET | `/restaurants/:id` | Publik | Detail restoran + menu + review |
| POST | `/restaurants` | Login | Tambah restoran baru |
| PUT | `/restaurants/:id` | Login | Update restoran |
| DELETE | `/restaurants/:id` | Login | Hapus restoran (+ menu & review terkait) |
| GET | `/restaurants/:id/menu` | Publik | List menu restoran |
| POST | `/restaurants/:id/menu` | Login | Tambah menu baru |
| PUT | `/menu/:id` | Login | Update menu |
| DELETE | `/menu/:id` | Login | Hapus menu |
| GET | `/restaurants/:id/reviews` | Publik | List review restoran |
| POST | `/restaurants/:id/reviews` | Login | Tambah review (1 user = 1 review/restoran) |
| DELETE | `/reviews/:id` | Login (pemilik) | Hapus review milik sendiri |
| GET | `/favorites` | Login | List restoran favorit |
| POST | `/favorites/:restaurantId` | Login | Tambah ke favorit |
| DELETE | `/favorites/:restaurantId` | Login | Hapus dari favorit |
| POST | `/orders` | Login | Buat pesanan dari keranjang |
| GET | `/orders/my` | Login | Riwayat pesanan sendiri |
| GET | `/orders/:id` | Login (pemilik) | Detail satu pesanan |

Setiap endpoint membalas format konsisten: `{ success, message?, data, count? }`.
Error membalas `{ success: false, message }` dengan status code HTTP yang sesuai (400/401/403/404/500).

---

## 4. Frontend — Ringkasan Halaman

| Route | Halaman | Akses |
|---|---|---|
| `/` | Home — hero, kategori, promo, rekomendasi | Publik |
| `/cari` | Search — filter & sort lengkap (kategori, harga, kota) | Publik |
| `/restoran/:id` | Detail restoran, menu, review | Publik |
| `/login`, `/register` | Autentikasi (desain premium centered-card) | Publik |
| `/keranjang` | Keranjang & checkout | Publik (checkout butuh login) |
| `/profil` | Profil & riwayat pesanan | Login |
| `/favorit` | Daftar restoran favorit | Login |
| `/admin` | Dashboard kelola restoran | Login (admin) |
| `/admin/restoran/baru` | Form tambah restoran | Login (admin) |
| `/admin/restoran/:id/edit` | Form edit restoran | Login (admin) |
| `/admin/restoran/:id/menu` | Kelola menu restoran | Login (admin) |

**State management:**
- `AuthContext` (`useReducer`) — status login, data user, fungsi `login()`/`register()`/`logout()`.
- `CartContext` (`useReducer`) — isi keranjang, terikat ke satu restoran per waktu (seperti
  GoFood/ShopeeFood), tersimpan di `sessionStorage` supaya tidak hilang saat refresh.

---

## 5. Cara Deploy

### Backend → Render atau Railway

1. Push folder `backend/` ke repository GitHub (folder `frontend/` boleh ada di repo yang sama).
2. Di [Render](https://render.com) atau [Railway](https://railway.app), buat **Web Service** baru,
   hubungkan ke repo, set **Root Directory** ke `backend`.
3. Build command: `npm install` — Start command: `npm start`.
4. Tambahkan environment variables yang sama seperti `.env` lokal (`MONGO_URI`, `JWT_SECRET`, dst.)
   lewat dashboard platform — **gunakan MongoDB Atlas** untuk production, bukan MongoDB lokal.
5. Setelah deploy, catat URL backend (mis. `https://carimakan-api.onrender.com`).

### Frontend → Vercel

1. Push folder `frontend/` ke GitHub (atau gunakan repo yang sama dengan Root Directory `frontend`).
2. Di [Vercel](https://vercel.com), import project, set **Root Directory** ke `frontend`.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Tambahkan environment variable `VITE_API_URL` = URL backend dari langkah deploy sebelumnya
   (mis. `https://carimakan-api.onrender.com/api`).
5. File `frontend/vercel.json` sudah disertakan untuk menangani SPA routing (supaya refresh di
   halaman seperti `/restoran/123` tidak menghasilkan 404).

> Setelah backend punya URL production, update juga environment variable `CLIENT_URL` di backend
> supaya konfigurasi CORS mengarah ke domain frontend yang benar.

---

## 6. Catatan untuk Developer

**Backend developer** bekerja penuh di folder `backend/`. Titik masuk: `src/server.js`. Tambahkan
fitur baru dengan pola: buat/ubah **model** → tulis **controller** → daftarkan di **route** →
gunakan middleware `protect` (dan `adminOnly` kalau butuh role-based) bila perlu login.

**Frontend developer** bekerja penuh di folder `frontend/`. Tambahkan halaman baru dengan pola:
buat file di `src/pages/` → daftarkan route di `src/App.jsx` → kalau butuh data baru dari API,
tambahkan fungsi di `src/api/` yang sesuai.

Kedua developer hanya perlu sepakat satu hal: **bentuk response JSON** dari tiap endpoint (sudah
didokumentasikan di bagian 3 di atas), supaya keduanya bisa bekerja paralel tanpa saling menunggu.

---

## 7. Catatan Desain Visual (Premium UI)

UI didesain mengikuti gaya food-delivery premium (referensi: GoFood, GrabFood, Airbnb) dengan palet
**"Ember"** (paprika, saffron, basil di atas latar linen krem hangat). Hanya tampilan yang diubah —
logic, routing, state management, dan seluruh pemanggilan API tetap sama persis seperti sebelumnya.

### Fitur Visual yang sudah diimplementasi:

- **Halaman Beranda:**
  - Hero besar dengan background foto makanan, gradient overlay gelap, dan animasi `fadeUp`.
  - Label promo "Gratis ongkir" transparan bergaya glassmorphism di atas hero.
  - Promo banner horizontal 3 kartu warna berbeda (paprika/basil/paprika-saffron).
  - Section **"Rekomendasi Terdekat"** — memakai endpoint `sort=nearest` dengan geolokasi browser (diam-diam, tidak blokir kalau ditolak).
  - Section **"Rekomendasi Spesial"** dengan filter kategori aktif.

- **Halaman Login & Register:**
  - Desain **Frosted Glass Card** (kartu kaca buram) di tengah layar dengan background foto kuliner.
  - Tombol "Lanjutkan dengan Google" (UI-only, untuk integrasi OAuth di masa depan).
  - Efek `scaleIn` animasi saat kartu muncul.

- **Halaman Pencarian (`/cari`):**
  - Filter bar lengkap: input teks, dropdown sort, dan panel ekspansi filter (kategori, harga, kota).
  - Tombol filter kapsul yang berfungsi penuh — bisa diklik untuk mengaktifkan/menonaktifkan filter, dengan indikator warna hijau saat aktif.
  - URL sinkron dengan state filter, sehingga link bisa di-share atau di-refresh tanpa kehilangan filter.
  - **Link Footer "Jelajahi" berfungsi penuh** — klik "Masakan Indonesia", "Seafood", dll. di footer akan langsung mengarahkan ke halaman pencarian dengan filter yang tepat.

- **Komponen RestaurantCard:**
  - Hover zoom & lift (kartu terangkat saat mouse masuk).
  - Tombol favorit (❤) dengan animasi `heartBeat` saat diklik.
  - Perbaikan **bug Chrome Zoom 80%**: gambar tidak lagi menggunakan `loading="lazy"` dan teks judul menggunakan `truncate` (bukan `line-clamp`) untuk menghindari bug rendering Chromium.

- **Komponen CategoryStrip:**
  - Gambar kategori dari Unsplash per kategori masakan.
  - Ring hijau aktif saat kategori dipilih.

- **Animasi custom** di `tailwind.config.js`: `heartBeat`, `float`, `slideUp`, `scaleIn`, `marquee`, `shimmer`, `fadeUp`, `popIn`.

- **Tipografi:** Fraunces (display/serif) + Plus Jakarta Sans (body/sans).

### Data Seed:
Data seed berisi **50 restoran** di sekitar Bandar Lampung supaya tampilan grid, filter, dan kategori
terasa penuh dan realistis saat demonstrasi. Jalankan `npm run seed` dari folder `backend/`.
