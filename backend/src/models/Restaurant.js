// src/models/Restaurant.js
// Model restoran. Field `rating` dan `reviewCount` adalah hasil agregasi dari
// koleksi Review (lihat Review.js static method), bukan diisi manual oleh
// admin — supaya rating selalu konsisten dengan review yang sebenarnya ada.
import mongoose from 'mongoose'

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama restoran wajib diisi'],
      trim: true,
      maxlength: [120, 'Nama maksimal 120 karakter'],
    },
    description: {
      type: String,
      required: [true, 'Deskripsi wajib diisi'],
      maxlength: [1000, 'Deskripsi maksimal 1000 karakter'],
    },
    address: {
      type: String,
      required: [true, 'Alamat wajib diisi'],
    },
    city: {
      type: String,
      required: [true, 'Kota wajib diisi'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Kategori wajib diisi'],
      trim: true,
    },
    priceLevel: {
      // murah | sedang | mahal — dipakai untuk filter harga di pencarian
      type: String,
      enum: ['murah', 'sedang', 'mahal'],
      required: [true, 'Tingkat harga wajib diisi'],
    },
    image: {
      type: String, // URL gambar (bukan file upload, sesuai keputusan desain)
      required: [true, 'URL gambar wajib diisi'],
    },
    openingHours: {
      type: String,
      default: '08:00 - 22:00',
    },
    // Koordinat opsional — kalau diisi, memungkinkan sorting "terdekat" di
    // frontend (dihitung dari posisi pengguna via Geolocation API browser).
    // Kalau tidak diisi, restoran tetap muncul normal, hanya tidak ikut
    // diurutkan saat user memilih sort "Terdekat".
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    owner: {
      // user (admin) yang membuat entri restoran ini
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

// Index teks untuk pencarian nama/kota/kategori yang efisien.
restaurantSchema.index({ name: 'text', city: 'text', category: 'text' })

const Restaurant = mongoose.model('Restaurant', restaurantSchema)
export default Restaurant
