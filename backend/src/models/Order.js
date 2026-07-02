// src/models/Order.js
// Model pesanan, dibuat saat user melakukan checkout dari keranjang di frontend.
// Setiap order menyimpan snapshot item (nama & harga saat itu) supaya riwayat
// pesanan tidak berubah meskipun harga menu di restoran berubah di kemudian hari.
import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true }, // snapshot nama menu
    price: { type: Number, required: true }, // snapshot harga saat order dibuat
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: 'Order harus memiliki minimal satu item',
      },
    },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'diproses', 'diantar', 'selesai', 'dibatalkan'],
      default: 'pending',
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Alamat pengiriman wajib diisi'],
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'transfer', 'ewallet'],
      default: 'cod',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

const Order = mongoose.model('Order', orderSchema)
export default Order
