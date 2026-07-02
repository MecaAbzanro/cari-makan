// src/pages/OrderDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchOrderById } from '../api/orderApi.js'
import LoadingState from '../components/LoadingState.jsx'
import { MapPinIcon, ClipboardIcon, ArrowRightIcon, ChevronLeftIcon } from '../components/Icons.jsx'
import { formatRupiah } from '../utils/format.js'
import { toast } from 'react-toastify'

const STATUS_STEPS = [
  { key: 'pending',    label: 'Diterima',  icon: '📋' },
  { key: 'diproses',   label: 'Diproses',  icon: '👨‍🍳' },
  { key: 'diantar',    label: 'Diantar',   icon: '🛵' },
  { key: 'selesai',    label: 'Selesai',   icon: '✅' },
]

const STATUS_COLOR = {
  pending:    'text-saffron-600 bg-saffron-50 border-saffron-200',
  diproses:   'text-blue-600 bg-blue-50 border-blue-200',
  diantar:    'text-purple-600 bg-purple-50 border-purple-200',
  selesai:    'text-basil-600 bg-basil-50 border-basil-200',
  dibatalkan: 'text-red-500 bg-red-50 border-red-200',
}

const STATUS_LABEL = {
  pending: 'Menunggu', diproses: 'Diproses', diantar: 'Diantar',
  selesai: 'Selesai', dibatalkan: 'Dibatalkan',
}

function StepperFull({ status }) {
  if (status === 'dibatalkan') {
    return (
      <div className="my-6 flex items-center gap-3 rounded-2xl bg-red-50 p-4 border border-red-100">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500 text-lg">✕</div>
        <div>
          <p className="font-semibold text-red-600">Pesanan Dibatalkan</p>
          <p className="text-xs text-red-400">Pesanan ini tidak dapat diproses lebih lanjut.</p>
        </div>
      </div>
    )
  }

  const currentIdx = STATUS_STEPS.findIndex(s => s.key === status)
  return (
    <div className="my-6">
      <div className="relative flex items-start justify-between">
        {/* Garis penghubung */}
        <div className="absolute left-5 right-5 top-5 h-0.5 bg-clay" style={{ zIndex: 0 }} />
        <div
          className="absolute left-5 top-5 h-0.5 bg-basil-400 transition-all duration-700"
          style={{ width: currentIdx === 0 ? 0 : `calc(${(currentIdx / (STATUS_STEPS.length - 1)) * 100}% - 40px)`, zIndex: 1 }}
        />

        {STATUS_STEPS.map((step, idx) => {
          const done = idx <= currentIdx
          const active = idx === currentIdx
          return (
            <div key={step.key} className="relative z-10 flex flex-1 flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-base transition-all duration-300 ${
                  done
                    ? 'border-basil-500 bg-basil-500 shadow-md'
                    : 'border-clay bg-white'
                } ${active ? 'ring-4 ring-basil-100' : ''}`}
              >
                {done ? <span>{step.icon}</span> : <div className="h-2 w-2 rounded-full bg-clay" />}
              </div>
              <span className={`text-center text-[11px] font-semibold ${done ? 'text-basil-600' : 'text-char-faint'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderById(id)
      .then(setOrder)
      .catch(() => {
        toast.error('Pesanan tidak ditemukan')
        navigate('/pesanan')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) {
    return (
      <div className="container-page py-12">
        <LoadingState />
      </div>
    )
  }

  if (!order) return null

  const orderId = order._id.slice(-8).toUpperCase()

  return (
    <div className="container-page py-10">
      {/* Back button */}
      <button
        onClick={() => navigate('/pesanan')}
        className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-char-soft transition-colors hover:text-basil-600"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Kembali ke Riwayat Pesanan
      </button>

      <div className="mx-auto max-w-2xl">
        {/* Header kartu utama */}
        <div className="overflow-hidden rounded-3xl border border-clay/70 bg-white shadow-card">
          {/* Banner restoran */}
          <div className="relative h-36 overflow-hidden bg-linen-soft sm:h-44">
            <img
              src={order.restaurant?.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop'}
              alt={order.restaurant?.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-char/70 via-char/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <p className="font-display text-xl font-bold text-white sm:text-2xl">
                {order.restaurant?.name || 'Restoran'}
              </p>
              <p className="text-xs text-linen/80">
                #{orderId} · {new Date(order.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
            <div className="absolute right-4 top-4">
              <span className={`rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur-sm ${STATUS_COLOR[order.status] || 'bg-white/80 text-char border-clay'}`}>
                {STATUS_LABEL[order.status] || order.status}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* Progress Stepper */}
            <h2 className="text-xs font-bold uppercase tracking-widest text-char-faint">Status Pesanan</h2>
            <StepperFull status={order.status} />

            {/* Item list */}
            <div className="mt-2">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-char-faint">Pesanan Kamu</h2>
              <div className="divide-y divide-clay/40 rounded-2xl border border-clay/50 overflow-hidden">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-white px-4 py-3 hover:bg-linen-soft/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-basil-100 text-xs font-bold text-basil-700">
                        {item.quantity}
                      </span>
                      <span className="truncate text-sm font-medium text-char">{item.name}</span>
                    </div>
                    <div className="ml-3 shrink-0 text-right">
                      <p className="text-sm font-semibold text-char">{formatRupiah(item.price * item.quantity)}</p>
                      <p className="text-[11px] text-char-faint">{formatRupiah(item.price)} / porsi</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rincian biaya */}
            <div className="mt-5">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-char-faint">Rincian Pembayaran</h2>
              <div className="rounded-2xl bg-linen-soft p-4 space-y-2 text-sm">
                <div className="flex justify-between text-char-soft">
                  <span>Subtotal ({order.items.reduce((s, i) => s + i.quantity, 0)} item)</span>
                  <span>{formatRupiah(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-char-soft">
                  <span>Ongkos Kirim</span>
                  <span>
                    {order.deliveryFee === 0
                      ? <span className="font-semibold text-basil-600">Gratis 🎉</span>
                      : formatRupiah(order.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-clay/70 pt-2 text-base font-bold text-char">
                  <span>Total Dibayar</span>
                  <span className="text-basil-700">{formatRupiah(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Info pengiriman */}
            <div className="mt-5">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-char-faint">Info Pengiriman</h2>
              <div className="rounded-2xl border border-clay/50 bg-white p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-basil-500" />
                  <div>
                    <p className="text-xs font-semibold text-char-faint">Alamat Pengiriman</p>
                    <p className="mt-0.5 text-sm text-char">{order.deliveryAddress}</p>
                  </div>
                </div>
                {order.notes && (
                  <div className="flex items-start gap-2.5 border-t border-clay/40 pt-3">
                    <ClipboardIcon className="mt-0.5 h-4 w-4 shrink-0 text-saffron-500" />
                    <div>
                      <p className="text-xs font-semibold text-char-faint">Catatan</p>
                      <p className="mt-0.5 text-sm italic text-char">{order.notes}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2.5 border-t border-clay/40 pt-3">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center font-bold text-blue-500">
                    $
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-char-faint">Metode Pembayaran</p>
                    <p className="mt-0.5 text-sm uppercase text-char">{order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod === 'transfer' ? 'Transfer Bank' : order.paymentMethod === 'ewallet' ? 'E-Wallet' : order.paymentMethod || 'COD'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Aksi */}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              {order.restaurant?._id && (
                <Link
                  to={`/restoran/${order.restaurant._id}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-basil-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-basil-700 hover:shadow-lg active:scale-95"
                >
                  Pesan Lagi dari Restoran Ini
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              )}
              <Link
                to="/cari"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-clay py-3 text-sm font-semibold text-char transition-all hover:border-basil-400 hover:text-basil-600"
              >
                Cari Restoran Lain
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
