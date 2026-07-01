// src/routes/restaurantRoutes.js
import express from 'express'
import {
  getRestaurants,
  getRestaurantById,
  getCategories,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from '../controllers/restaurantController.js'
import { getMenuItems, createMenuItem } from '../controllers/menuItemController.js'
import { getReviews, createReview } from '../controllers/reviewController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// Endpoint khusus harus didaftarkan SEBELUM "/:id", supaya Express tidak
// salah mengira "categories" sebagai sebuah ID restoran.
router.get('/categories', getCategories)

router.route('/').get(getRestaurants).post(protect, adminOnly, createRestaurant)

router.route('/:id').get(getRestaurantById).put(protect, adminOnly, updateRestaurant).delete(protect, adminOnly, deleteRestaurant)

// Nested: GET/POST /api/restaurants/:restaurantId/menu
router.route('/:restaurantId/menu').get(getMenuItems).post(protect, adminOnly, createMenuItem)

// Nested: GET/POST /api/restaurants/:restaurantId/reviews
router.route('/:restaurantId/reviews').get(getReviews).post(protect, createReview)

export default router
