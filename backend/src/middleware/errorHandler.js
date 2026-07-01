// src/middleware/errorHandler.js
// Penanganan error terpusat. Controller cukup throw new Error(...) atau
// melempar error dari Mongoose — middleware ini yang merapikan jadi response
// JSON yang konsisten, termasuk menerjemahkan error umum Mongoose
// (validation error, duplicate key, cast error/ID tidak valid).

export function notFound(req, res, next) {
  res.status(404)
  next(new Error(`Route tidak ditemukan: ${req.originalUrl}`))
}

export function errorHandler(err, req, res, next) {
  // Kalau status code belum di-set (masih default 200), anggap ini 500.
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode
  let message = err.message || 'Terjadi kesalahan pada server'

  // Mongoose: ObjectId tidak valid (mis. /api/restaurants/abc123)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404
    message = 'Data dengan ID tersebut tidak ditemukan'
  }

  // Mongoose: validasi schema gagal
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ')
  }

  // Mongoose: duplicate key (mis. email/registrasi review ganda)
  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue || {})[0]
    message = field === 'email' ? 'Email sudah terdaftar' : `${field} sudah digunakan`
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Stack trace hanya muncul di mode development, jangan bocor ke production.
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  })
}
