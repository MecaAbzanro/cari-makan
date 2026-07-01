// src/models/MenuItem.js
// Model menu makanan. Setiap menu selalu terhubung ke satu restoran (restaurant ref).
import mongoose from 'mongoose'

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Nama menu wajib diisi'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Deskripsi maksimal 500 karakter'],
    },
    price: {
      type: Number,
      required: [true, 'Harga wajib diisi'],
      min: [0, 'Harga tidak boleh negatif'],
    },
    image: {
      type: String,
      default: '',
    },
    category: {
      type: String, // mis. "Makanan Utama", "Minuman", "Dessert"
      default: 'Lainnya',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

menuItemSchema.index({ restaurant: 1 })

const MenuItem = mongoose.model('MenuItem', menuItemSchema)
export default MenuItem
