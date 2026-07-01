// src/routes/favoriteRoutes.js
import express from 'express'
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect) // semua endpoint favorite wajib login

router.get('/', getFavorites)
router.post('/:restaurantId', addFavorite)
router.delete('/:restaurantId', removeFavorite)

export default router
