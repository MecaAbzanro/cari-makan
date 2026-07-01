// src/controllers/restaurantController.js
import asyncHandler from 'express-async-handler'
import Restaurant from '../models/Restaurant.js'
import MenuItem from '../models/MenuItem.js'
import Review from '../models/Review.js'

// @route   GET /api/restaurants
// @access  Public
// Query params yang didukung:
//   q          → cari di nama/kota/kategori (text search)
//   category   → filter kategori persis (mis. "Seafood")
//   priceLevel → filter "murah" | "sedang" | "mahal"
//   minRating  → filter rating >= angka ini
//   sort       → "rating" (default, tertinggi dulu) | "price" (termurah,
//                proxy dari priceLevel) | "newest" | "nearest"
//   lat, lng   → posisi pengguna, wajib diisi kalau sort=nearest
export const getRestaurants = asyncHandler(async (req, res) => {
  const { q, category, priceLevel, minRating, sort, lat, lng } = req.query

  const filter = {}

  if (q) {
    filter.$text = { $search: q }
  }
  if (category) {
    filter.category = category
  }
  if (priceLevel) {
    filter.priceLevel = priceLevel
  }
  if (minRating) {
    filter.rating = { $gte: Number(minRating) }
  }

  let query = Restaurant.find(filter)

  // priceLevel adalah enum kategorikal (bukan angka), jadi "termurah" kita
  // urutkan lewat urutan logis murah→sedang→mahal pakai $expr di agregasi
  // sederhana: paling praktis dengan sort manual di JS setelah query kecil,
  // karena jumlah restoran pada skala aplikasi ini wajar untuk diolah di memori.
  const priceOrder = { murah: 0, sedang: 1, mahal: 2 }

  if (sort === 'newest') {
    query = query.sort({ createdAt: -1 })
  } else if (sort === 'price') {
    // ambil dulu, urutkan manual berdasarkan priceOrder, baru kirim
  } else if (sort === 'nearest' && lat && lng) {
    // diurutkan manual juga (lihat di bawah) karena perlu hitung jarak Haversine
  } else {
    // default: rating tertinggi dulu
    query = query.sort({ rating: -1 })
  }

  let restaurants = await query.lean()

  if (sort === 'price') {
    restaurants = restaurants.sort((a, b) => priceOrder[a.priceLevel] - priceOrder[b.priceLevel])
  }

  if (sort === 'nearest' && lat && lng) {
    const userLat = Number(lat)
    const userLng = Number(lng)
    restaurants = restaurants
      .map((r) => ({
        ...r,
        distanceKm: r.location?.lat != null ? haversineDistance(userLat, userLng, r.location.lat, r.location.lng) : null,
      }))
      .sort((a, b) => {
        // Restoran tanpa koordinat ditaruh di akhir, bukan dianggap "0 km"
        if (a.distanceKm === null) return 1
        if (b.distanceKm === null) return -1
        return a.distanceKm - b.distanceKm
      })
  }

  res.json({
    success: true,
    count: restaurants.length,
    data: restaurants,
  })
})

// Rumus Haversine: jarak antara dua titik koordinat di permukaan bumi (km).
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // radius bumi dalam km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

function toRad(deg) {
  return (deg * Math.PI) / 180
}

// @route   GET /api/restaurants/:id
// @access  Public
// Mengembalikan detail restoran + daftar menu + daftar review sekaligus,
// supaya frontend cukup satu request untuk merender seluruh halaman detail.
export const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id)

  if (!restaurant) {
    res.status(404)
    throw new Error('Restoran tidak ditemukan')
  }

  const [menuItems, reviews] = await Promise.all([
    MenuItem.find({ restaurant: restaurant._id }).sort({ category: 1, name: 1 }),
    Review.find({ restaurant: restaurant._id }).sort({ createdAt: -1 }).populate('user', 'name'),
  ])

  res.json({
    success: true,
    data: { restaurant, menuItems, reviews },
  })
})

// @route   GET /api/restaurants/categories
// @access  Public
// Daftar kategori unik yang sedang ada, dipakai untuk render filter/strip kategori
// di frontend tanpa hardcode daftar kategori secara manual.
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Restaurant.distinct('category')
  res.json({ success: true, data: categories })
})

// @route   POST /api/restaurants
// @access  Private (login, admin sederhana — lihat catatan di middleware/auth.js)
export const createRestaurant = asyncHandler(async (req, res) => {
  const { name, description, address, city, category, priceLevel, image, openingHours, location } = req.body

  const restaurant = await Restaurant.create({
    name,
    description,
    address,
    city,
    category,
    priceLevel,
    image,
    openingHours,
    location,
    owner: req.user._id,
  })

  res.status(201).json({ success: true, message: 'Restoran berhasil ditambahkan', data: restaurant })
})

// @route   PUT /api/restaurants/:id
// @access  Private
export const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id)

  if (!restaurant) {
    res.status(404)
    throw new Error('Restoran tidak ditemukan')
  }

  const fields = ['name', 'description', 'address', 'city', 'category', 'priceLevel', 'image', 'openingHours', 'location']
  fields.forEach((field) => {
    if (req.body[field] !== undefined) restaurant[field] = req.body[field]
  })

  await restaurant.save()
  res.json({ success: true, message: 'Restoran berhasil diperbarui', data: restaurant })
})

// @route   DELETE /api/restaurants/:id
// @access  Private
export const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id)

  if (!restaurant) {
    res.status(404)
    throw new Error('Restoran tidak ditemukan')
  }

  // Hapus juga seluruh menu & review yang menempel, supaya tidak ada
  // data yatim (orphan) yang menunjuk ke restoran yang sudah tidak ada.
  await Promise.all([
    MenuItem.deleteMany({ restaurant: restaurant._id }),
    Review.deleteMany({ restaurant: restaurant._id }),
    restaurant.deleteOne(),
  ])

  res.json({ success: true, message: 'Restoran berhasil dihapus' })
})
