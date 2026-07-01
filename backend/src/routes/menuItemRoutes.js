// src/routes/menuItemRoutes.js
// Route ini menangani operasi pada satu menu spesifik via ID-nya langsung
// (PUT/DELETE /api/menu/:id). Untuk GET semua menu & POST menu baru,
// lihat nested route di restaurantRoutes.js (/api/restaurants/:id/menu)
// karena operasi itu selalu dalam konteks satu restoran.
import express from 'express'
import { updateMenuItem, deleteMenuItem } from '../controllers/menuItemController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.route('/:id').put(protect, adminOnly, updateMenuItem).delete(protect, adminOnly, deleteMenuItem)

export default router
