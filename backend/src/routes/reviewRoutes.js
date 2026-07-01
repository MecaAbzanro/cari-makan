// src/routes/reviewRoutes.js
// Menangani DELETE /api/reviews/:id. GET & POST review ada di nested route
// restaurantRoutes.js karena selalu dalam konteks satu restoran.
import express from 'express'
import { deleteReview } from '../controllers/reviewController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.delete('/:id', protect, deleteReview)

export default router
