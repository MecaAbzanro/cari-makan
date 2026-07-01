// src/pages/Profile.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchMyOrders } from '../api/orderApi.js'
import EmptyState from '../components/EmptyState.jsx'
import { PackageIcon, MapPinIcon } from '../components/Icons.jsx'
import { formatRupiah } from '../utils/format.js'

const STATUS_LABEL = {
  pending: 'Menunggu Konfirmasi',
  diproses: 'Diproses',
  diantar: 'Diantar',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
}

const STATUS_COLOR = {
  pending: 'bg-saffron-50 text-saffron-600',
  diproses: 'bg-saffron-50 text-saffron-600',
  diantar: 'bg-basil-50 text-basil-600',
  selesai: 'bg-basil-50 text-basil-600',
  dibatalkan: 'bg-clay text-char-soft',
}

export default function Profile() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container-page py-8">
      <div className="flex animate-fadeUp items-center gap-4 rounded-3xl border border-clay/70 bg-white p-6 shadow-card">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-saffron-400 to-saffron-500 font-display text-2xl font-bold text-linen shadow-soft">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-char">{user?.name}</h1>
          <p className="text-sm text-char-soft">{user?.email}</p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-char">Riwayat Pesanan</h2>

        <div className="mt-4">
          {loading && <div className="skeleton h-32 w-full rounded-3xl" />}

          {!loading && orders.length === 0 && (
            <EmptyState
              icon={PackageIcon}
              title="Belum ada pesanan"
              description="Riwayat pesananmu akan muncul di sini setelah kamu checkout."
            />
          )}

          {!loading && orders.length > 0 && (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order._id} className="rounded-2xl border border-clay/70 bg-white p-4 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-linen-soft">
                        {order.restaurant?.image && (
                          <img src={order.restaurant.image} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-char">{order.restaurant?.name || 'Restoran'}</p>
                        <p className="text-xs text-char-faint">
                          {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`chip ${STATUS_COLOR[order.status] || 'bg-clay text-char-soft'}`}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 border-t border-clay pt-3 text-sm text-char-soft">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{formatRupiah(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-clay pt-3">
                    <span className="flex items-center gap-1.5 text-xs text-char-faint">
                      <MapPinIcon className="h-3.5 w-3.5" /> {order.deliveryAddress}
                    </span>
                    <span className="text-sm font-semibold text-char">{formatRupiah(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
