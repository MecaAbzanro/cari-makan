// src/utils/generateToken.js
// Membungkus jwt.sign supaya konfigurasi (secret, expiry) terpusat di satu
// tempat — controller tidak perlu tahu detail opsi JWT.
import jwt from 'jsonwebtoken'

export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  })
}

export default generateToken
