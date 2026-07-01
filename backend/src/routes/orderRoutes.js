// src/routes/orderRoutes.js
import express from 'express'
import { createOrder, getMyOrders, getOrderById } from '../controllers/orderController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect) // semua endpoint order wajib login

router.post('/', createOrder)
router.get('/my', getMyOrders)
router.get('/:id', getOrderById)

export default router
