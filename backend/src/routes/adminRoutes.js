// src/routes/adminRoutes.js
// Semua endpoint di router ini dilindungi protect + adminOnly,
// jadi tidak perlu pasang middleware per-route lagi.
import express from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import {
  getStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUserRole,
} from '../controllers/adminController.js'

const router = express.Router()

router.use(protect, adminOnly) // semua route di bawah wajib admin

router.get('/stats', getStats)
router.get('/orders', getAllOrders)
router.put('/orders/:id/status', updateOrderStatus)
router.get('/users', getAllUsers)
router.put('/users/:id/role', updateUserRole)

export default router
