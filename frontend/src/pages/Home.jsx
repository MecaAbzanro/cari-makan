// src/pages/Home.jsx
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { fetchRestaurants, fetchCategories } from '../api/restaurantApi.js'
import { fetchFavorites, addFavorite, removeFavorite } from '../api/favoriteApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import RestaurantCard from '../components/RestaurantCard.jsx'
import CategoryStrip from '../components/CategoryStrip.jsx'
import LoadingState from '../components/LoadingState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { SearchIcon, CompassIcon, MapPinIcon, FlameIcon, StarIcon, ArrowRightIcon } from '../components/Icons.jsx'
import { toast } from 'react-toastify'

const PROMO_CARDS = [
  {
    eyebrow: 'Promo Spesial',
    title: '40% Off Untuk Pesanan Pertama',
    note: 'Pakai kode HALOENAK',
    accent: 'from-paprika-500 to-paprika-700',
  },
  {
    eyebrow: 'Gratis Ongkir',
    title: 'Order Min. Rp 50rb',
    note: 'Setiap hari, semua restoran',
    accent: 'from-basil-500 to-basil-700',
  },
  {
    eyebrow: 'Baru',
    title: 'Sate & Nusantara Terkurasi',
    note: 'Cita rasa otentik dari penjuru negeri',
    accent: 'from-paprika-600 to-saffron-600',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('')
  const [restaurants, setRestaurants] = useState([])
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  // Section "Rekomendasi Terdekat" — memakai endpoint & param sort=nearest
  // yang sudah tersedia di backend (lihat restaurantController.getRestaurants),
  // hanya ditambahkan sebagai pemakaian baru, bukan logic baru.
  const [nearby, setNearby] = useState([])
  const [nearbyStatus, setNearbyStatus] = useState('idle') // idle | loading | ready | unavailable

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    fetchRestaurants({ category: activeCategory, sort: 'rating' })
      .then((data) => {
        if (active) setRestaurants(data)
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Gagal memuat restoran')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [activeCategory])

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set())
      return
    }
    fetchFavorites()
      .then((favs) => setFavoriteIds(new Set(favs.map((f) => f._id))))
      .catch(() => {})
  }, [isAuthenticated])

  // Minta lokasi secara diam-diam (tidak memblokir apa pun kalau ditolak/tidak
  // didukung) untuk mengisi section "Rekomendasi Terdekat".
  useEffect(() => {
    if (!navigator.geolocation) {
      setNearbyStatus('unavailable')
      return
    }
    setNearbyStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchRestaurants({ sort: 'nearest', lat: pos.coords.latitude, lng: pos.coords.longitude })
          .then((data) => {
            setNearby(data.slice(0, 4))
            setNearbyStatus('ready')
          })
          .catch(() => setNearbyStatus('unavailable'))
      },
      () => setNearbyStatus('unavailable'),
      { timeout: 8000 }
    )
  }, [])

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/cari?q=${encodeURIComponent(query.trim())}`)
  }

  async function handleToggleFavorite(restaurantId) {
    if (!isAuthenticated) {
      toast.info('Silakan masuk dulu untuk menambah favorit')
      navigate('/login')
      return
    }
    const isFav = favoriteIds.has(restaurantId)
    try {
      if (isFav) {
        await removeFavorite(restaurantId)
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          next.delete(restaurantId)
          return next
        })
        toast.success('Dihapus dari favorit')
      } else {
        await addFavorite(restaurantId)
        setFavoriteIds((prev) => new Set(prev).add(restaurantId))
        toast.success('Ditambahkan ke favorit')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui favorit')
    }
  }

  return (
    <div className="pb-16">
      {/* Hero super besar — background gambar makanan dengan overlay gelap */}
      <section 
        className="relative overflow-hidden bg-char bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-char/80 via-char/70 to-basil-900/60" />
        <div className="container-page relative py-16 text-center sm:py-28">
          <span className="inline-flex animate-fadeUp items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-linen backdrop-blur border border-white/10">
            Gratis ongkir ke seluruh area Bandar Lampung
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl animate-fadeUp font-display text-4xl font-bold leading-[1.15] text-linen sm:text-6xl" style={{ animationDelay: '80ms' }}>
            Lapar? Cari makan favoritmu di sini.
          </h1>
          <p className="mx-auto mt-5 max-w-lg animate-fadeUp text-sm text-linen/90 sm:text-base" style={{ animationDelay: '150ms' }}>
            Dari nasi padang sampai sate — ratusan restoran lokal, ribuan menu, review jujur dari pengguna lain.
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto mt-8 flex max-w-2xl animate-fadeUp items-center gap-2"
            style={{ animationDelay: '220ms' }}
          >
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-char-faint" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari restoran, masakan, atau kota..."
                className="w-full rounded-full border-0 bg-white py-4 pl-12 pr-4 text-sm sm:text-base text-char shadow-lift focus:outline-none focus:ring-4 focus:ring-basil-300/50"
              />
            </div>
            <button type="submit" className="rounded-full bg-gradient-to-r from-paprika-500 to-paprika-600 px-8 py-4 text-sm sm:text-base font-bold text-white shadow-[0_8px_20px_-6px_rgba(194,84,47,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-6px_rgba(194,84,47,0.6)] active:translate-y-0 active:scale-95">
              Cari
            </button>
          </form>
        </div>
      </section>

      <div className="container-page">
        {/* Promo banner horizontal — pola 3 kartu warna berbeda ala referensi */}
        <section className="-mt-10 grid gap-4 sm:-mt-12 sm:grid-cols-3">
          {PROMO_CARDS.map((promo, i) => (
            <div
              key={promo.title}
              className={`flex flex-col animate-slideUp rounded-3xl bg-gradient-to-br ${promo.accent} p-6 text-linen shadow-glow`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-linen/80">{promo.eyebrow}</p>
              <p className="mt-2 font-display text-xl font-bold leading-snug">{promo.title}</p>
              <p className="mt-1.5 text-sm text-linen/85">{promo.note}</p>
              <div className="mt-auto pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/cari')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-char transition-transform hover:scale-105 active:scale-95"
                >
                  Pesan Sekarang →
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Kategori */}
        {categories.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 font-display text-xl font-bold text-char">Kategori Favorit</h2>
            <CategoryStrip categories={categories} active={activeCategory} onSelect={setActiveCategory} />
          </section>
        )}

        {/* Rekomendasi Terdekat — tampil hanya kalau lokasi berhasil didapat */}
        {nearbyStatus === 'ready' && nearby.length > 0 && (
          <section className="mt-12">
            <div className="mb-4 flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-basil-500" />
              <h2 className="font-display text-xl font-bold text-char">Rekomendasi Terdekat</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {nearby.map((r) => (
                <RestaurantCard
                  key={r._id}
                  restaurant={r}
                  isFavorite={favoriteIds.has(r._id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        {/* Restoran Populer / hasil filter kategori */}
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StarIcon className="h-6 w-6 text-basil-600" />
              <h2 className="font-display text-2xl font-bold text-char">
                {activeCategory ? `Restoran ${activeCategory}` : 'Rekomendasi Spesial'}
              </h2>
            </div>
            <Link to="/cari" className="flex items-center gap-1 text-sm font-semibold text-basil-600 hover:text-basil-700">
              Lihat semua <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {loading && <LoadingState />}

          {!loading && error && (
            <EmptyState
              icon={CompassIcon}
              title="Gagal memuat restoran"
              description={error}
            />
          )}

          {!loading && !error && restaurants.length === 0 && (
            <EmptyState
              icon={CompassIcon}
              title="Belum ada restoran di kategori ini"
              description="Coba pilih kategori lain atau lihat semua restoran."
            />
          )}

          {!loading && !error && restaurants.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {restaurants.map((r) => (
                <RestaurantCard
                  key={r._id}
                  restaurant={r}
                  isFavorite={favoriteIds.has(r._id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
