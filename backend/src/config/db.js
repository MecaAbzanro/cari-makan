// src/config/db.js
// Menangani koneksi ke MongoDB (lokal maupun Atlas) menggunakan Mongoose.
// URI database diambil dari environment variable MONGO_URI (lihat .env).
import mongoose from 'mongoose'
import { setServers } from 'dns'

export async function connectDB() {
  // Gunakan Google DNS agar SRV record MongoDB Atlas selalu bisa di-resolve,
  // termasuk di environment hosting (Render) maupun jaringan lokal yang terbatas.
  setServers(['8.8.8.8', '8.8.4.4'])

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`✅ MongoDB tersambung: ${conn.connection.host}/${conn.connection.name}`)
  } catch (error) {
    console.error(`❌ Gagal konek ke MongoDB: ${error.message}`)
    // Hentikan proses kalau database tidak bisa diakses sama sekali,
    // karena hampir semua endpoint API butuh database.
    process.exit(1)
  }
}

export default connectDB
