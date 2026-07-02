// src/pages/admin/AdminOrders.jsx
// Halaman admin untuk melihat semua pesanan dari semua user dan mengubah
// status pesanan (pending → diproses → diantar → selesai / dibatalkan).
import { useEffect, useState } from 'react'
import { fetchAllOrders, updateOrderStatus } from '../../api/adminApi.js'
import LoadingState from '../../components/LoadingState.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { ClipboardIcon, PackageIcon } from '../../components/Icons.jsx'
import { formatRupiah } from '../../utils/format.js'
import { toast } from 'react-toastify'

const STATUS_OPTIONS = ['pending', 'diproses', 'diantar', 'selesai', 'dibatalkan']

// Warna badge status pesanan — dibedakan agar mudah dibaca sekilas
const STATUS_STYLE = {
  pending: 'bg-saffron-50 text-saffron-700',
  diproses: 'bg-blue-50 text-blue-700',
  diantar: 'bg-purple-50 text-purple-700',
  selesai: 'bg-basil-50 text-basil-700',
  dibatalkan: 'bg-red-50 text-red-700',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    fetchAllOrders()
      .then(setOrders)
      .catch(() => toast.error('Gagal memuat pesanan'))
      .finally(() => setLoading(false))
  }, [])

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingId(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)))
      toast.success('Status pesanan berhasil diperbarui')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-char sm:text-3xl">
          <ClipboardIcon className="h-6 w-6 text-basil-500" /> Kelola Pesanan
        </h1>
        <p className="mt-1 text-sm text-char-soft">
          Lihat semua pesanan dan ubah statusnya.
        </p>
      </div>

      {loading && <LoadingState />}

      {!loading && orders.length === 0 && (
        <EmptyState
          icon={PackageIcon}
          title="Belum ada pesanan"
          description="Belum ada user yang melakukan pemesanan."
        />
      )}

      {!loading && orders.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-clay/70 bg-white shadow-card">
          {/* Header desktop */}
          <div className="hidden grid-cols-[1fr_1fr_1fr_0.8fr_1fr_auto] gap-3 border-b border-clay bg-linen-soft px-5 py-3 text-xs font-semibold uppercase tracking-wide text-char-faint lg:grid">
            <span>ID Pesanan</span>
            <span>User</span>
            <span>Restoran</span>
            <span>Total</span>
            <span>Tanggal</span>
            <span className="text-right">Status</span>
          </div>

          {orders.map((order) => (
            <div
              key={order._id}
              className="grid grid-cols-1 gap-2 border-b border-clay px-5 py-4 last:border-b-0 lg:grid-cols-[1fr_1fr_1fr_0.8fr_1fr_auto] lg:items-center lg:gap-3"
            >
              {/* ID */}
              <div>
                <span className="text-[10px] font-semibold uppercase text-char-faint lg:hidden">ID: </span>
                <span className="font-mono text-xs text-char-soft">#{order._id.slice(-8)}</span>
              </div>

              {/* User */}
              <div>
                <span className="text-[10px] font-semibold uppercase text-char-faint lg:hidden">User: </span>
                <p className="text-sm font-medium text-char">{order.user?.name || '-'}</p>
                <p className="text-xs text-char-faint">{order.user?.email || ''}</p>
              </div>

              {/* Restoran */}
              <div className="flex items-center gap-2">
                {order.restaurant?.image && (
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-linen-soft">
                    <img src={order.restaurant.image} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <span className="truncate text-sm text-char-soft">{order.restaurant?.name || '-'}</span>
              </div>

              {/* Total */}
              <div>
                <span className="text-[10px] font-semibold uppercase text-char-faint lg:hidden">Total: </span>
                <span className="text-sm font-semibold text-char">{formatRupiah(order.total)}</span>
                <p className="text-[10px] uppercase text-char-faint mt-0.5">{order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod === 'transfer' ? 'Transfer' : order.paymentMethod === 'ewallet' ? 'E-Wallet' : order.paymentMethod || 'COD'}</p>
              </div>

              {/* Tanggal */}
              <div>
                <span className="text-[10px] font-semibold uppercase text-char-faint lg:hidden">Tanggal: </span>
                <span className="text-xs text-char-soft">
                  {new Date(order.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Status dropdown */}
              <div className="flex items-center lg:justify-end">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  disabled={updatingId === order._id}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-basil-300 disabled:cursor-wait disabled:opacity-60 ${STATUS_STYLE[order.status] || 'bg-linen-soft text-char-soft'}`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
