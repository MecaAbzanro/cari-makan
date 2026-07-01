// src/pages/Favorites.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchFavorites, removeFavorite } from '../api/favoriteApi.js'
import RestaurantCard from '../components/RestaurantCard.jsx'
import LoadingState from '../components/LoadingState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { HeartIcon } from '../components/Icons.jsx'
import { toast } from 'react-toastify'

export default function Favorites() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
      .then(setFavorites)
      .catch(() => toast.error('Gagal memuat daftar favorit'))
      .finally(() => setLoading(false))
  }, [])

  async function handleRemove(restaurantId) {
    try {
      await removeFavorite(restaurantId)
      setFavorites((prev) => prev.filter((r) => r._id !== restaurantId))
      toast.success('Dihapus dari favorit')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus favorit')
    }
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-2xl font-bold text-char sm:text-3xl">Restoran Favorit</h1>
      <p className="mt-1 text-sm text-char-soft">Daftar restoran yang sudah kamu simpan.</p>

      <div className="mt-6">
        {loading && <LoadingState />}

        {!loading && favorites.length === 0 && (
          <EmptyState
            icon={HeartIcon}
            title="Belum ada favorit"
            description="Tambahkan restoran ke favorit supaya mudah ditemukan lagi nanti."
            action={
              <button type="button" onClick={() => navigate('/cari')} className="btn-primary mt-2">
                Cari Restoran
              </button>
            }
          />
        )}

        {!loading && favorites.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {favorites.map((r) => (
              <RestaurantCard key={r._id} restaurant={r} isFavorite onToggleFavorite={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
