// src/controllers/orderController.js
import asyncHandler from 'express-async-handler'
import Order from '../models/Order.js'
import MenuItem from '../models/MenuItem.js'

// @route   POST /api/orders
// @access  Private
// Body: { restaurant, items: [{ menuItem, quantity }], deliveryAddress, notes }
// Harga & nama menu diambil ulang dari database (bukan dipercaya begitu saja
// dari frontend), supaya user tidak bisa memanipulasi harga lewat request.
export const createOrder = asyncHandler(async (req, res) => {
  const { restaurant, items, deliveryAddress, notes, paymentMethod } = req.body

  if (!items || items.length === 0) {
    res.status(400)
    throw new Error('Order harus memiliki minimal satu item')
  }
  if (!deliveryAddress) {
    res.status(400)
    throw new Error('Alamat pengiriman wajib diisi')
  }
  if (!paymentMethod || !['cod', 'transfer', 'ewallet'].includes(paymentMethod)) {
    res.status(400)
    throw new Error('Metode pembayaran tidak valid')
  }

  const menuIds = items.map((i) => i.menuItem)
  const menuItems = await MenuItem.find({ _id: { $in: menuIds } })

  const orderItems = items.map((reqItem) => {
    const menuItem = menuItems.find((m) => m._id.toString() === reqItem.menuItem)
    if (!menuItem) {
      res.status(404)
      throw new Error(`Menu dengan id ${reqItem.menuItem} tidak ditemukan`)
    }
    return {
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: reqItem.quantity,
    }
  })

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = subtotal >= 75000 ? 0 : 8000 // gratis ongkir di atas Rp75.000, konsisten dgn proyek sebelumnya
  const total = subtotal + deliveryFee

  const order = await Order.create({
    user: req.user._id,
    restaurant,
    items: orderItems,
    subtotal,
    deliveryFee,
    total,
    deliveryAddress,
    notes,
    paymentMethod,
  })

  res.status(201).json({ success: true, message: 'Pesanan berhasil dibuat', data: order })
})

// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('restaurant', 'name image')

  res.json({ success: true, count: orders.length, data: orders })
})

// @route   GET /api/orders/:id
// @access  Private (hanya pemilik order)
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('restaurant', 'name image address')

  if (!order) {
    res.status(404)
    throw new Error('Pesanan tidak ditemukan')
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Kamu tidak punya akses ke pesanan ini')
  }

  res.json({ success: true, data: order })
})
