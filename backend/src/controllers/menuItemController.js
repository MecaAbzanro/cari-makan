// src/controllers/menuItemController.js
import asyncHandler from 'express-async-handler'
import MenuItem from '../models/MenuItem.js'
import Restaurant from '../models/Restaurant.js'

// @route   GET /api/restaurants/:restaurantId/menu
// @access  Public
export const getMenuItems = asyncHandler(async (req, res) => {
  const menuItems = await MenuItem.find({ restaurant: req.params.restaurantId }).sort({ category: 1, name: 1 })
  res.json({ success: true, count: menuItems.length, data: menuItems })
})

// @route   POST /api/restaurants/:restaurantId/menu
// @access  Private
export const createMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId)
  if (!restaurant) {
    res.status(404)
    throw new Error('Restoran tidak ditemukan')
  }

  const { name, description, price, image, category, isAvailable } = req.body

  const menuItem = await MenuItem.create({
    restaurant: restaurant._id,
    name,
    description,
    price,
    image,
    category,
    isAvailable,
  })

  res.status(201).json({ success: true, message: 'Menu berhasil ditambahkan', data: menuItem })
})

// @route   PUT /api/menu/:id
// @access  Private
export const updateMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id)
  if (!menuItem) {
    res.status(404)
    throw new Error('Menu tidak ditemukan')
  }

  const fields = ['name', 'description', 'price', 'image', 'category', 'isAvailable']
  fields.forEach((field) => {
    if (req.body[field] !== undefined) menuItem[field] = req.body[field]
  })

  await menuItem.save()
  res.json({ success: true, message: 'Menu berhasil diperbarui', data: menuItem })
})

// @route   DELETE /api/menu/:id
// @access  Private
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id)
  if (!menuItem) {
    res.status(404)
    throw new Error('Menu tidak ditemukan')
  }

  await menuItem.deleteOne()
  res.json({ success: true, message: 'Menu berhasil dihapus' })
})
