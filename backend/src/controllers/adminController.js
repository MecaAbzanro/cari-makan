// src/controllers/adminController.js
// Handler khusus admin: statistik dashboard, manajemen pesanan & user.
// Semua endpoint di sini hanya bisa diakses lewat middleware protect + adminOnly.
import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import Restaurant from '../models/Restaurant.js'
import Order from '../models/Order.js'
import Review from '../models/Review.js'

// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = asyncHandler(async (req, res) => {
  const [totalRestaurants, totalUsers, totalOrders, totalReviews, revenueAgg] = await Promise.all([
    Restaurant.countDocuments(),
    User.countDocuments(),
    Order.countDocuments(),
    Review.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: 'dibatalkan' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ]),
  ])

  const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0

  res.json({
    success: true,
    data: { totalRestaurants, totalUsers, totalOrders, totalReviews, totalRevenue },
  })
})

// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .populate('restaurant', 'name image')

  res.json({ success: true, count: orders.length, data: orders })
})

// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const validStatuses = ['pending', 'diproses', 'diantar', 'selesai', 'dibatalkan']

  if (!status || !validStatuses.includes(status)) {
    res.status(400)
    throw new Error(`Status tidak valid. Pilihan: ${validStatuses.join(', ')}`)
  }

  const order = await Order.findById(req.params.id)
  if (!order) {
    res.status(404)
    throw new Error('Pesanan tidak ditemukan')
  }

  order.status = status
  await order.save()

  res.json({ success: true, message: 'Status pesanan berhasil diperbarui', data: order })
})

// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-favorites').sort({ createdAt: -1 })

  res.json({ success: true, count: users.length, data: users })
})

// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body

  if (!role || !['user', 'admin'].includes(role)) {
    res.status(400)
    throw new Error('Role tidak valid. Pilihan: user, admin')
  }

  const targetUser = await User.findById(req.params.id)
  if (!targetUser) {
    res.status(404)
    throw new Error('User tidak ditemukan')
  }

  // Cegah admin menurunkan dirinya sendiri (proteksi sederhana)
  if (targetUser._id.toString() === req.user._id.toString() && role !== 'admin') {
    res.status(400)
    throw new Error('Kamu tidak bisa mengubah role dirimu sendiri')
  }

  targetUser.role = role
  await targetUser.save()

  res.json({
    success: true,
    message: `Role ${targetUser.name} berhasil diubah menjadi ${role}`,
    data: targetUser.toSafeObject(),
  })
})
