// src/models/User.js
// Model pengguna. Password di-hash otomatis sebelum disimpan (pre-save hook),
// supaya controller tidak perlu mengurus hashing secara manual setiap saat.
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama wajib diisi'],
      trim: true,
      maxlength: [100, 'Nama maksimal 100 karakter'],
    },
    email: {
      type: String,
      required: [true, 'Email wajib diisi'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Format email tidak valid'],
    },
    password: {
      type: String,
      required: [true, 'Password wajib diisi'],
      minlength: [6, 'Password minimal 6 karakter'],
      select: false, // tidak ikut terambil di query biasa, harus eksplisit .select('+password')
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
      },
    ],
  },
  { timestamps: true }
)

// Hash password sebelum disimpan, hanya jika field password berubah
// (mis. saat user ganti password nanti, bukan setiap kali dokumen di-save).
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Method instance untuk membandingkan password plaintext dengan hash di DB.
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Representasi JSON publik: jangan pernah kirim hash password ke client.
userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    favorites: this.favorites,
    createdAt: this.createdAt,
  }
}

const User = mongoose.model('User', userSchema)
export default User
