// src/pages/Orders.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyOrders } from '../api/orderApi.js'
import LoadingState from '../components/LoadingState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { ClipboardIcon, PackageIcon, MapPinIcon, ChevronRightIcon, CheckCircleIcon } from '../components/Icons.jsx'
import { formatRupiah } from '../utils/format.js'
import { toast } from 'react-toastify'

// Status tahapan untuk progress bar
const STATUS_STEPS = ['pending', 'diproses', 'diantar', 'selesai']

const STATUS_LABEL = {
  pending: 'Menunggu',
  diproses: 'Diproses',
  diantar: 'Diantar',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
}

const STATUS_COLOR = {
  pending: 'text-saffron-600 bg-saffron-50 border-saffron-200',
  diproses: 'text-blue-600 bg-blue-50 border-blue-200',
  diantar: 'text-purple-600 bg-purple-50 border-purple-200',
  selesai: 'text-basil-600 bg-basil-50 border-basil-200',
  dibatalkan: 'text-red-500 bg-red-50 border-red-200',
}

const TABS = [
  { key: 'semua', label: 'Semua' },
  { key: 'berlangsung', label: 'Berlangsung' },
  { key: 'selesai', label: 'Selesai' },
  { key: 'dibatalkan', label: 'Dibatalkan' },
]

function StatusProgress({ status }) {
  if (status === 'dibatalkan') {
    return (
      <div className="mt-4 flex items-center gap-2 text-xs text-red-500">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
          <span className="text-[10px] font-bold">✕</span>
        </div>
        <span className="font-semibold">Pesanan dibatalkan</span>
      </div>
    )
  }

  const currentIdx = STATUS_STEPS.indexOf(status)
  return (
    <div className="mt-4 flex items-center gap-0">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx
        const active = idx === currentIdx
        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  done
                    ? 'border-basil-500 bg-basil-500 text-white'
                    : 'border-clay bg-white text-char-faint'
                } ${active ? 'ring-2 ring-basil-200' : ''}`}
              >
                {done ? (
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10.28 1.28L3.989 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z" />
                  </svg>
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-clay" />
                )}
              </div>
              <span className={`mt-1 text-[9px] font-semibold ${done ? 'text-basil-600' : 'text-char-faint'}`}>
                {STATUS_LABEL[step]}
              </span>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`mx-1 -mt-4 h-0.5 flex-1 ${idx < currentIdx ? 'bg-basil-400' : 'bg-clay'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function OrderCard({ order, idx }) {
  return (
    <div
      className="animate-slideUp overflow-hidden rounded-3xl border border-clay/70 bg-white shadow-card transition-all hover:border-basil-300 hover:shadow-soft"
      style={{ animationDelay: `${idx * 60}ms` }}
    >
      {/* Header: restoran + status + tanggal */}
      <div className="flex items-center gap-3 border-b border-clay/50 px-5 py-4">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-linen-soft">
          <img
            src={order.restaurant?.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=200&auto=format&fit=crop'}
            alt={order.restaurant?.name || 'Restoran'}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-semibold text-char">
            {order.restaurant?.name || 'Restoran Dihapus'}
          </p>
          <p className="text-xs text-char-faint">
            {new Date(order.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${STATUS_COLOR[order.status] || 'bg-linen-soft text-char-soft border-clay'}`}>
          {STATUS_LABEL[order.status] || order.status}
        </span>
      </div>

      {/* Progress tracker */}
      <div className="px-5 pb-4">
        <StatusProgress status={order.status} />

        {/* Item list */}
        <div className="mt-4 space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-linen-soft px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-basil-100 text-[10px] font-bold text-basil-700">
                  {item.quantity}
                </span>
                <span className="truncate text-sm text-char">{item.name}</span>
              </div>
              <span className="ml-2 shrink-0 text-sm font-semibold text-char">
                {formatRupiah(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Rincian biaya */}
        <div className="mt-4 border-t border-clay/50 pt-3 space-y-1 text-xs text-char-soft">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatRupiah(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Ongkos kirim</span>
            <span>{order.deliveryFee === 0 ? <span className="text-basil-600 font-semibold">Gratis</span> : formatRupiah(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-clay/40 pt-2 text-sm font-bold text-char">
            <span>Total</span>
            <span className="text-basil-700">{formatRupiah(order.total)}</span>
          </div>
        </div>

        {/* Alamat */}
        {order.deliveryAddress && (
          <div className="mt-3 flex items-start gap-1.5 text-xs text-char-soft">
            <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-basil-400" />
            <span className="line-clamp-2">{order.deliveryAddress}</span>
          </div>
        )}

        {/* Catatan */}
        {order.notes && (
          <p className="mt-1.5 rounded-lg bg-saffron-50 px-3 py-1.5 text-xs italic text-saffron-700">
            📝 {order.notes}
          </p>
        )}

        {/* Aksi */}
        <div className="mt-4 flex items-center justify-between gap-2">
          {order.restaurant?._id && (
            <Link
              to={`/restoran/${order.restaurant._id}`}
              className="rounded-full border border-basil-400 px-4 py-1.5 text-xs font-semibold text-basil-600 transition-colors hover:bg-basil-50"
            >
              Pesan Lagi
            </Link>
          )}
          <Link
            to={`/pesanan/${order._id}`}
            className="ml-auto flex items-center gap-1 rounded-full bg-basil-600 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-basil-700"
          >
            Lihat Detail
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('semua')

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch(() => toast.error('Gagal memuat riwayat pembelian'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter((o) => {
    if (activeTab === 'semua') return true
    if (activeTab === 'berlangsung') return ['pending', 'diproses', 'diantar'].includes(o.status)
    if (activeTab === 'selesai') return o.status === 'selesai'
    if (activeTab === 'dibatalkan') return o.status === 'dibatalkan'
    return true
  })

  return (
    <div className="container-page py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-basil-600 text-white">
            <ClipboardIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-char sm:text-3xl">Riwayat Pesanan</h1>
            <p className="text-sm text-char-soft">Semua pesanan yang pernah kamu buat</p>
          </div>
        </div>

        {/* Tab Filter */}
        <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {TABS.map((tab) => {
            const count = tab.key === 'semua'
              ? orders.length
              : orders.filter((o) => {
                  if (tab.key === 'berlangsung') return ['pending', 'diproses', 'diantar'].includes(o.status)
                  return o.status === tab.key
                }).length
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-basil-600 text-white shadow-md'
                    : 'border border-clay bg-white text-char-soft hover:border-basil-300 hover:text-char'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-linen-soft text-char-faint'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      {loading && <LoadingState />}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={PackageIcon}
          title={activeTab === 'semua' ? 'Belum ada pesanan' : `Tidak ada pesanan ${TABS.find(t => t.key === activeTab)?.label.toLowerCase()}`}
          description={activeTab === 'semua' ? 'Yuk, pesan makanan favoritmu sekarang!' : 'Coba pilih tab lain untuk melihat pesanan kamu.'}
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((order, i) => (
            <OrderCard key={order._id} order={order} idx={i} />
          ))}
        </div>
      )}
    </div>
  )
}
