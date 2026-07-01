// src/pages/admin/AdminRestaurants.jsx
// Halaman daftar restoran yang sebelumnya ada di Dashboard.jsx, dipindahkan
// ke halaman terpisah supaya Dashboard bisa fokus ke statistik ringkasan.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchRestaurants, deleteRestaurant } from '../../api/restaurantApi.js'
import LoadingState from '../../components/LoadingState.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import RatingStars from '../../components/RatingStars.jsx'
import { GridIcon, PlusIcon, EditIcon, TrashIcon, PackageIcon } from '../../components/Icons.jsx'
import { PRICE_LEVEL_LABEL } from '../../utils/format.js'
import { toast } from 'react-toastify'

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  function loadRestaurants() {
    setLoading(true)
    fetchRestaurants({ sort: 'newest' })
      .then(setRestaurants)
      .catch(() => toast.error('Gagal memuat daftar restoran'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRestaurants()
  }, [])

  async function handleDelete(id, name) {
    if (!window.confirm(`Hapus restoran "${name}"? Semua menu dan review terkait juga akan terhapus.`)) return
    try {
      await deleteRestaurant(id)
      setRestaurants((prev) => prev.filter((r) => r._id !== id))
      toast.success('Restoran berhasil dihapus')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus restoran')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-char sm:text-3xl">
            <GridIcon className="h-6 w-6 text-basil-500" /> Kelola Restoran
          </h1>
          <p className="mt-1 text-sm text-char-soft">
            Tambah, ubah, atau hapus data restoran beserta menunya.
          </p>
        </div>
        <Link to="/admin/restoran/baru" className="btn-primary">
          <PlusIcon className="h-4 w-4" /> Tambah Restoran
        </Link>
      </div>

      <div className="mt-6">
        {loading && <LoadingState />}

        {!loading && restaurants.length === 0 && (
          <EmptyState
            icon={PackageIcon}
            title="Belum ada restoran"
            description='Klik "Tambah Restoran" untuk mulai mengisi data.'
          />
        )}

        {!loading && restaurants.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-clay/70 bg-white shadow-card">
            <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 border-b border-clay bg-linen-soft px-5 py-3 text-xs font-semibold uppercase tracking-wide text-char-faint sm:grid">
              <span>Restoran</span>
              <span>Kategori</span>
              <span>Harga</span>
              <span>Rating</span>
              <span className="text-right">Aksi</span>
            </div>

            {restaurants.map((r) => (
              <div
                key={r._id}
                className="grid grid-cols-1 gap-3 border-b border-clay px-5 py-4 last:border-b-0 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-linen-soft">
                    <img src={r.image} alt={r.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-char">{r.name}</p>
                    <p className="truncate text-xs text-char-faint">{r.city}</p>
                  </div>
                </div>
                <span className="text-sm text-char-soft">{r.category}</span>
                <span className="text-sm text-char-soft">{PRICE_LEVEL_LABEL[r.priceLevel]}</span>
                <RatingStars rating={r.rating} reviewCount={r.reviewCount} />
                <div className="flex items-center gap-2 sm:justify-end">
                  <Link
                    to={`/admin/restoran/${r._id}/menu`}
                    className="rounded-full border border-clay px-3 py-1.5 text-xs font-semibold text-char-soft transition-colors hover:border-basil-400 hover:text-basil-500"
                  >
                    Menu
                  </Link>
                  <Link
                    to={`/admin/restoran/${r._id}/edit`}
                    className="grid h-8 w-8 place-items-center rounded-full border border-clay text-char-soft transition-colors hover:border-basil-400 hover:text-basil-500"
                    aria-label="Edit"
                  >
                    <EditIcon className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(r._id, r.name)}
                    className="grid h-8 w-8 place-items-center rounded-full border border-clay text-char-soft transition-colors hover:border-basil-400 hover:text-basil-500"
                    aria-label="Hapus"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
