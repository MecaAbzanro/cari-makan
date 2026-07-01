// src/models/Review.js
// Model review/rating restoran. Satu user hanya boleh memberi satu review
// per restoran (unique compound index). Setiap kali review dibuat, diubah,
// atau dihapus, rating rata-rata di dokumen Restaurant dihitung ulang lewat
// static method calculateAverageRating, dipanggil dari post-hook di bawah.
import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating wajib diisi'],
      min: [1, 'Rating minimal 1'],
      max: [5, 'Rating maksimal 5'],
    },
    comment: {
      type: String,
      required: [true, 'Komentar wajib diisi'],
      maxlength: [500, 'Komentar maksimal 500 karakter'],
    },
  },
  { timestamps: true }
)

// Satu user hanya boleh review satu restoran sekali (mencegah spam review).
reviewSchema.index({ restaurant: 1, user: 1 }, { unique: true })

// Static method: hitung ulang rating rata-rata & jumlah review sebuah
// restoran, lalu simpan hasilnya langsung ke dokumen Restaurant terkait.
reviewSchema.statics.calculateAverageRating = async function calculateAverageRating(restaurantId) {
  const Restaurant = mongoose.model('Restaurant')

  const stats = await this.aggregate([
    { $match: { restaurant: restaurantId } },
    {
      $group: {
        _id: '$restaurant',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ])

  if (stats.length > 0) {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: Math.round(stats[0].avgRating * 10) / 10, // dibulatkan 1 desimal
      reviewCount: stats[0].count,
    })
  } else {
    // Tidak ada review tersisa (mis. setelah review terakhir dihapus)
    await Restaurant.findByIdAndUpdate(restaurantId, { rating: 0, reviewCount: 0 })
  }
}

// Jalankan agregasi setiap kali review baru disimpan.
reviewSchema.post('save', function postSave() {
  this.constructor.calculateAverageRating(this.restaurant)
})

// Jalankan agregasi setiap kali review dihapus lewat findOneAndDelete/findByIdAndDelete.
reviewSchema.post('findOneAndDelete', function postFindOneAndDelete(doc) {
  if (doc) doc.constructor.calculateAverageRating(doc.restaurant)
})

const Review = mongoose.model('Review', reviewSchema)
export default Review
