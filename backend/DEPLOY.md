# Backend CariMakan — Panduan Deploy ke Render

## Environment Variables yang WAJIB diisi di Render

| Key | Value (contoh / cara mendapatkan) |
|-----|----------------------------------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render auto-set ini, tapi aman ditulis) |
| `MONGO_URI` | `mongodb+srv://<user>:<pass>@cluster.mongodb.net/carimakan?retryWrites=true&w=majority` |
| `JWT_SECRET` | String acak panjang, contoh: `s3cr3t_y4ng_p4nj4ng_d4n_kuat_123!` |

## Cara Deploy

### 1. Buat akun di [Render.com](https://render.com)
### 2. Upload kode ke GitHub terlebih dahulu
### 3. Buat "New Web Service" di Render:
- **Repository**: pilih repo GitHub kamu
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**: isi sesuai tabel di atas

Setelah deploy, kamu akan dapat URL seperti:
`https://carimakan-api.onrender.com`
