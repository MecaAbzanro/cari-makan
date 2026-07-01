// src/middleware/auth.js
// Dua middleware utama:
// - protect: memastikan request punya token JWT valid, lalu menempelkan
//   data user (tanpa password) ke req.user supaya controller berikutnya
//   bisa langsung pakai.
// - adminOnly: dipakai SETELAH protect, menolak akses kalau req.user.role
//   bukan 'admin'. TIDAK dipakai di routes/admin saat ini — sesuai
//   keputusan desain, halaman admin versi sederhana hanya butuh login
//   (siapa pun yang sudah login boleh akses /admin), belum role-based.
//   Middleware ini tetap disediakan kalau suatu saat proyek mau upgrade
//   ke admin sungguhan (tinggal pasang di routes, tidak perlu tulis ulang).
import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/User.js'

export const protect = asyncHandler(async (req, res, next) => {
  let token

  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  }

  if (!token) {
    res.status(401)
    throw new Error('Tidak ada akses. Silakan login terlebih dahulu.')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      res.status(401)
      throw new Error('User pemilik token ini sudah tidak ada.')
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401)
    throw new Error('Token tidak valid atau sudah kedaluwarsa.')
  }
})

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next()
  }
  res.status(403)
  throw new Error('Akses ditolak. Halaman ini khusus admin.')
}
