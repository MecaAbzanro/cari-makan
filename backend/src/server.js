// src/server.js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import connectDB from './config/db.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

import authRoutes from './routes/authRoutes.js'
import restaurantRoutes from './routes/restaurantRoutes.js'
import menuItemRoutes from './routes/menuItemRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import favoriteRoutes from './routes/favoriteRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

const app = express()

// Daftar origin yang diizinkan (lokal + produksi)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL, // URL frontend produksi (set di Render/Vercel env)
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // izinkan request tanpa origin (curl, Postman) dan origin yang terdaftar
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: origin ${origin} tidak diizinkan`))
    }
  },
  credentials: true,
}))
app.use(express.json()) // parsing body JSON
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev')) // log tiap request di console, memudahkan debugging
}

// --- Health check sederhana, berguna untuk verifikasi server hidup ---
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CariMakan API berjalan normal' })
})

// --- Daftar route ---
app.use('/api/auth', authRoutes)
app.use('/api/restaurants', restaurantRoutes)
app.use('/api/menu', menuItemRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

// --- Error handling (harus didaftarkan PALING TERAKHIR) ---
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

async function start() {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`🚀 Server CariMakan jalan di http://localhost:${PORT}`)
  })
}

start()
