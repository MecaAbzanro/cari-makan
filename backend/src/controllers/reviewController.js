// src/controllers/reviewController.js
import asyncHandler from 'express-async-handler'
import Review from '../models/Review.js'
import Restaurant from '../models/Restaurant.js'

// @route   GET /api/restaurants/:restaurantId/reviews
// @access  Public
export const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ restaurant: req.params.restaurantId })
    .sort({ createdAt: -1 })
    .populate('user', 'name')

  res.json({ success: true, count: reviews.length, data: reviews })
})

// @route   POST /api/restaurants/:restaurantId/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body
  const restaurant = await Restaurant.findById(req.params.restaurantId)

  if (!restaurant) {
    res.status(404)
    throw new Error('Restoran tidak ditemukan')
  }

  const alreadyReviewed = await Review.findOne({ restaurant: restaurant._id, user: req.user._id })
  if (alreadyReviewed) {
    res.status(400)
    throw new Error('Kamu sudah pernah memberi review untuk restoran ini')
  }

  const review = await Review.create({
    restaurant: restaurant._id,
    user: req.user._id,
    rating,
    comment,
  })

  // calculateAverageRating otomatis terpanggil lewat post-save hook di model Review.
  await review.populate('user', 'name')

  res.status(201).json({ success: true, message: 'Review berhasil ditambahkan', data: review })
})

// @route   DELETE /api/reviews/:id
// @access  Private (pemilik review ATAU admin)
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)

  if (!review) {
    res.status(404)
    throw new Error('Review tidak ditemukan')
  }

  // Admin boleh menghapus review siapa pun (moderasi konten).
  // User biasa hanya bisa menghapus review miliknya sendiri.
  const isOwner = review.user.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'admin'

  if (!isOwner && !isAdmin) {
    res.status(403)
    throw new Error('Kamu hanya bisa menghapus review milikmu sendiri')
  }

  await review.deleteOne()
  // Catatan: hook post('findOneAndDelete') di model tidak otomatis terpicu
  // oleh document.deleteOne() instance method, jadi kita hitung ulang manual
  // di sini agar rating restoran tetap akurat setelah review dihapus.
  await Review.calculateAverageRating(review.restaurant)

  res.json({ success: true, message: 'Review berhasil dihapus' })
})
