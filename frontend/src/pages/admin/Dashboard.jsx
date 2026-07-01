// src/pages/admin/Dashboard.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminStats } from '../../api/adminApi.js'
import LoadingState from '../../components/LoadingState.jsx'
import { BarChartIcon, GridIcon, ClipboardIcon, UsersIcon, StarIcon } from '../../components/Icons.jsx'
import { formatRupiah } from '../../utils/format.js'
import { toast } from 'react-toastify'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(() => toast.error('Gagal memuat statistik'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState />

  const cards = [
    {
      label: 'Total Restoran',
      value: stats?.totalRestaurants ?? 0,
      icon: GridIcon,
      color: 'from-basil-500 to-basil-600',
      link: '/admin/restoran',
    },
    {
      label: 'Total User',
      value: stats?.totalUsers ?? 0,
      icon: UsersIcon,
      color: 'from-basil-500 to-basil-700',
      link: '/admin/users',
    },
    {
      label: 'Total Pesanan',
      value: stats?.totalOrders ?? 0,
      icon: ClipboardIcon,
      color: 'from-saffron-500 to-saffron-600',
      link: '/admin/pesanan',
    },
    {
      label: 'Total Review',
      value: stats?.totalReviews ?? 0,
      icon: StarIcon,
      color: 'from-basil-400 to-saffron-500',
      link: null,
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-char sm:text-3xl">
          <BarChartIcon className="h-6 w-6 text-basil-500" /> Dashboard Admin
        </h1>
        <p className="mt-1 text-sm text-char-soft">
          Ringkasan data CariMakan secara keseluruhan.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className="animate-slideUp overflow-hidden rounded-3xl border border-clay/70 bg-white p-5 shadow-card"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-char-faint">{card.label}</span>
              <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${card.color} text-linen shadow-sm`}>
                <card.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-char">{card.value.toLocaleString('id-ID')}</p>
            {card.link && (
              <Link to={card.link} className="mt-2 inline-block text-xs font-semibold text-basil-500 transition-colors hover:text-basil-700">
                Lihat detail →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Revenue card */}
      <div className="mt-4 animate-slideUp rounded-3xl border border-clay/70 bg-gradient-to-r from-char to-char/90 p-6 text-linen shadow-card" style={{ animationDelay: '320ms' }}>
        <p className="text-xs font-semibold uppercase tracking-wider text-linen/70">Total Pendapatan (Order Non-Batal)</p>
        <p className="mt-2 font-display text-4xl font-bold">{formatRupiah(stats?.totalRevenue ?? 0)}</p>
      </div>

      {/* Quick links */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Link to="/admin/restoran" className="group flex items-center gap-3 rounded-2xl border border-clay/70 bg-white p-4 shadow-sm transition-all hover:border-basil-400 hover:shadow-soft">
          <GridIcon className="h-5 w-5 text-basil-500" />
          <div>
            <p className="text-sm font-semibold text-char group-hover:text-basil-600">Kelola Restoran</p>
            <p className="text-xs text-char-faint">Tambah, ubah, hapus restoran & menu</p>
          </div>
        </Link>
        <Link to="/admin/pesanan" className="group flex items-center gap-3 rounded-2xl border border-clay/70 bg-white p-4 shadow-sm transition-all hover:border-basil-400 hover:shadow-soft">
          <ClipboardIcon className="h-5 w-5 text-saffron-500" />
          <div>
            <p className="text-sm font-semibold text-char group-hover:text-basil-600">Kelola Pesanan</p>
            <p className="text-xs text-char-faint">Lihat & ubah status semua pesanan</p>
          </div>
        </Link>
        <Link to="/admin/users" className="group flex items-center gap-3 rounded-2xl border border-clay/70 bg-white p-4 shadow-sm transition-all hover:border-basil-400 hover:shadow-soft">
          <UsersIcon className="h-5 w-5 text-basil-600" />
          <div>
            <p className="text-sm font-semibold text-char group-hover:text-basil-600">Kelola Users</p>
            <p className="text-xs text-char-faint">Lihat daftar user & ubah role</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

