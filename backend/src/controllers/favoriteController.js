// src/controllers/favoriteController.js
import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import Restaurant from '../models/Restaurant.js'

// @route   GET /api/favorites
// @access  Private
export const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites')
  res.json({ success: true, count: user.favorites.length, data: user.favorites })
})

// @route   POST /api/favorites/:restaurantId
// @access  Private
export const addFavorite = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId)
  if (!restaurant) {
    res.status(404)
    throw new Error('Restoran tidak ditemukan')
  }

  const user = await User.findById(req.user._id)
  const alreadyFavorited = user.favorites.some((id) => id.toString() === restaurant._id.toString())

  if (alreadyFavorited) {
    res.status(400)
    throw new Error('Restoran sudah ada di favorit')
  }

  // $addToSet bersifat atomic & otomatis mencegah duplikat di level database,
  // jadi aman walau ada dua request bersamaan (mis. double-klik tombol favorit).
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { favorites: restaurant._id } },
    { new: true }
  )

  res.status(201).json({ success: true, message: 'Ditambahkan ke favorit', data: updatedUser.favorites })
})

// @route   DELETE /api/favorites/:restaurantId
// @access  Private
export const removeFavorite = asyncHandler(async (req, res) => {
  // $pull juga atomic, tidak perlu baca dokumen dulu sebelum menulis.
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { favorites: req.params.restaurantId } },
    { new: true }
  )

  res.json({ success: true, message: 'Dihapus dari favorit', data: updatedUser.favorites })
})
