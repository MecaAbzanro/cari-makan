# CariMakan — Frontend

React 18 + Vite + Tailwind CSS untuk aplikasi pencarian & pemesanan makanan CariMakan.

## Tech Stack

- React 18 (functional components + hooks)
- React Router v6 (routing client-side)
- Context API + `useReducer` (state management: auth & keranjang)
- Axios (HTTP client ke backend)
- Tailwind CSS (styling, palet kustom "Ember")
- React Icons (set ikon Feather)
- React Toastify (notifikasi)

## Struktur Folder

```
src/
├── api/            → Semua pemanggilan HTTP ke backend, dikelompokkan per resource
│   ├── client.js       → instance axios terpusat (baseURL + interceptor token)
│   ├── authApi.js, restaurantApi.js, menuApi.js, reviewApi.js,
│   │   favoriteApi.js, orderApi.js
├── context/        → Global state lewat Context API + useReducer
│   ├── AuthContext.jsx → status login, register/login/logout, validasi token
│   └── CartContext.jsx → keranjang (single-restaurant, persist ke sessionStorage)
├── components/     → Komponen reusable (Header, Footer, RestaurantCard, dst)
├── pages/          → Satu file per halaman/route
│   └── admin/      → Dashboard, RestaurantForm, MenuManager (kelola data)
└── utils/format.js → formatRupiah(), label tingkat harga
```

## Instalasi & Menjalankan

```bash
cd frontend
npm install
cp .env.example .env   # sesuaikan VITE_API_URL kalau backend tidak di localhost:5000
npm run dev             # buka http://localhost:5173
```

Build production:

```bash
npm run build    # output ke dist/
npm run preview  # preview hasil build
```

## Environment Variables

| Variabel | Keterangan | Default |
|---|---|---|
| `VITE_API_URL` | Base URL backend API | `http://localhost:5000/api` |

## Alur Akses (mirip GoFood)

- **Tanpa login**: browsing Home, Search & Filter, lihat detail restoran & menu, lihat isi keranjang.
- **Wajib login**: checkout, memberi review, favorit, lihat profil & riwayat pesanan, akses `/admin`.
- Saat mencoba aksi yang butuh login tanpa sesi aktif, pengguna diarahkan ke `/login` dan otomatis
  dikembalikan ke halaman asal setelah berhasil masuk (lihat `ProtectedRoute.jsx`).

## Catatan Desain

Palet warna ("Ember": linen, paprika, saffron, basil, char) dan beberapa pola komponen
(CategoryStrip, kartu produk, skeleton loading) konsisten dengan proyek CariMakan React
sebelumnya, supaya identitas visual tetap sama walau backend-nya berbeda (kali ini MERN penuh,
bukan konsumsi API publik).

Upload foto restoran/menu memakai **URL gambar**, bukan file upload — pengguna cukup
menempelkan link gambar (mis. dari Unsplash) di form admin.
