// src/pages/RestaurantDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchRestaurantById } from '../api/restaurantApi.js'
import { createReview, deleteReview } from '../api/reviewApi.js'
import { fetchFavorites, addFavorite, removeFavorite } from '../api/favoriteApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import RatingStars from '../components/RatingStars.jsx'
import EmptyState from '../components/EmptyState.jsx'
import {
  MapPinIcon,
  ClockIcon,
  HeartIcon,
  PlusIcon,
  ChevronLeftIcon,
  TrashIcon,
  PackageIcon,
} from '../components/Icons.jsx'
import { formatRupiah, PRICE_LEVEL_LABEL } from '../utils/format.js'
import { toast } from 'react-toastify'

export default function RestaurantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { addItem, restaurantId: cartRestaurantId, items: cartItems } = useCart()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeMenuCategory, setActiveMenuCategory] = useState('Semua')

  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    fetchRestaurantById(id)
      .then((res) => {
        if (active) setData(res)
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Restoran tidak ditemukan')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (!isAuthenticated) return
    fetchFavorites()
      .then((favs) => setIsFavorite(favs.some((f) => f._id === id)))
      .catch(() => {})
  }, [isAuthenticated, id])

  async function handleToggleFavorite() {
    if (!isAuthenticated) {
      toast.info('Silakan masuk dulu untuk menambah favorit')
      navigate('/login')
      return
    }
    try {
      if (isFavorite) {
        await removeFavorite(id)
        setIsFavorite(false)
        toast.success('Dihapus dari favorit')
      } else {
        await addFavorite(id)
        setIsFavorite(true)
        toast.success('Ditambahkan ke favorit')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui favorit')
    }
  }

  function handleAddToCart(menuItem) {
    const added = addItem(menuItem, data.restaurant._id, data.restaurant.name)
    if (added) toast.success(`${menuItem.name} ditambahkan ke keranjang`)
  }

  async function handleSubmitReview(e) {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.info('Silakan masuk dulu untuk memberi review')
      navigate('/login')
      return
    }
    if (!reviewComment.trim()) {
      toast.error('Tulis komentar review terlebih dahulu')
      return
    }

    setSubmittingReview(true)
    try {
      const newReview = await createReview(id, { rating: reviewRating, comment: reviewComment.trim() })
      setData((prev) => ({ ...prev, reviews: [newReview, ...prev.reviews] }))
      setReviewComment('')
      setReviewRating(5)
      toast.success('Review berhasil ditambahkan')
      // Refresh data restoran supaya rating rata-rata ter-update di tampilan
      const refreshed = await fetchRestaurantById(id)
      setData(refreshed)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim review')
    } finally {
      setSubmittingReview(false)
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!window.confirm('Hapus review ini?')) return
    try {
      await deleteReview(reviewId)
      setData((prev) => ({ ...prev, reviews: prev.reviews.filter((r) => r._id !== reviewId) }))
      toast.success('Review berhasil dihapus')
      const refreshed = await fetchRestaurantById(id)
      setData(refreshed)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus review')
    }
  }

  if (loading) {
    return (
      <div className="container-page py-8">
        <div className="skeleton h-64 w-full rounded-4xl sm:h-80" />
        <div className="skeleton mt-6 h-8 w-1/2" />
        <div className="skeleton mt-3 h-4 w-1/3" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container-page py-8">
        <EmptyState icon={PackageIcon} title="Restoran tidak ditemukan" description={error} />
      </div>
    )
  }

  const { restaurant, menuItems, reviews } = data
  const menuCategories = ['Semua', ...new Set(menuItems.map((m) => m.category))]
  const visibleMenu = activeMenuCategory === 'Semua' ? menuItems : menuItems.filter((m) => m.category === activeMenuCategory)
  const cartHasOtherRestaurant = cartItems.length > 0 && cartRestaurantId && cartRestaurantId !== restaurant._id

  return (
    <div className="pb-16">
      {/* Hero gambar restoran — lebih besar & gradient lebih dramatis */}
      <div className="relative h-80 w-full overflow-hidden bg-linen-soft sm:h-[26rem]">
        <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-char via-char/30 to-transparent" />

        <Link
          to="/cari"
          className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-char shadow-soft backdrop-blur transition-transform hover:scale-105"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>

        <button
          type="button"
          onClick={handleToggleFavorite}
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-char shadow-soft backdrop-blur transition-transform hover:scale-105"
        >
          <HeartIcon className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-basil-500 text-basil-500' : ''}`} />
        </button>

        <div className="absolute bottom-5 left-0 right-0 px-4 sm:px-6">
          <div className="container-page">
            <span className="chip bg-saffron-500 text-linen shadow-soft">{restaurant.category}</span>
            <h1 className="mt-2 font-display text-3xl font-bold text-linen drop-shadow-lg sm:text-4xl">
              {restaurant.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="container-page">
        <div className="-mt-6 animate-slideUp rounded-3xl border border-clay/70 bg-white p-5 shadow-glow sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="max-w-2xl text-sm leading-relaxed text-char-soft">{restaurant.description}</p>
            <span className="chip shrink-0 bg-basil-50 text-basil-700">
              {PRICE_LEVEL_LABEL[restaurant.priceLevel] || restaurant.priceLevel}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-char-soft">
            <RatingStars rating={restaurant.rating} reviewCount={restaurant.reviewCount} size="lg" />
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4 text-basil-400" /> {restaurant.address}, {restaurant.city}
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4 text-basil-400" /> {restaurant.openingHours}
            </span>
          </div>
        </div>

        {/* Menu */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-char">Menu</h2>

          {cartHasOtherRestaurant && (
            <p className="mt-2 rounded-xl bg-saffron-50 px-4 py-2.5 text-xs text-saffron-700">
              Keranjangmu masih berisi menu dari restoran lain. Menambah menu di sini akan menawarkan
              untuk mengosongkan keranjang lama.
            </p>
          )}

          {menuCategories.length > 1 && (
            <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
              {menuCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveMenuCategory(cat)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                    activeMenuCategory === cat
                      ? 'border-transparent bg-gradient-to-r from-basil-500 to-basil-600 text-linen shadow-glow'
                      : 'border-clay bg-white text-char-soft hover:border-basil-300 hover:text-basil-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {visibleMenu.length === 0 ? (
            <p className="mt-6 text-sm text-char-soft">Belum ada menu di kategori ini.</p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleMenu.map((item, i) => (
                <div
                  key={item._id}
                  className="card-premium group animate-fadeUp overflow-hidden"
                  style={{ animationDelay: `${(i % 6) * 60}ms` }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-linen-soft">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-char-faint">
                        <PackageIcon className="h-9 w-9" />
                      </div>
                    )}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 grid place-items-center bg-char/60 backdrop-blur-[1px]">
                        <span className="chip bg-white text-char">Tidak Tersedia</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.isAvailable}
                      className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-basil-500 to-basil-600 text-linen shadow-glow transition-transform hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:from-clay disabled:to-clay disabled:text-char-faint disabled:shadow-none"
                      aria-label={`Tambah ${item.name} ke keranjang`}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="truncate text-sm font-semibold text-char">{item.name}</h3>
                    {item.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-char-soft">{item.description}</p>
                    )}
                    <p className="mt-1.5 font-display text-base font-bold text-basil-600">{formatRupiah(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Review */}
        <section className="mt-14">
          <h2 className="font-display text-xl font-bold text-char">
            Review ({reviews.length})
          </h2>

          <form onSubmit={handleSubmitReview} className="mt-4 rounded-3xl border border-clay/70 bg-white p-5 shadow-card">
            <p className="text-sm font-semibold text-char">Tulis review kamu</p>
            <div className="mt-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-0.5 text-xl transition-transform hover:scale-125"
                  aria-label={`Beri rating ${star}`}
                >
                  <span className={star <= reviewRating ? 'text-saffron-500' : 'text-clay'}>★</span>
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Bagaimana pengalamanmu di restoran ini?"
              rows={3}
              maxLength={500}
              className="input-field mt-2 resize-none"
            />
            <button type="submit" disabled={submittingReview} className="btn-primary mt-3">
              {submittingReview ? 'Mengirim...' : 'Kirim Review'}
            </button>
          </form>

          {reviews.length === 0 ? (
            <p className="mt-6 text-sm text-char-soft">Belum ada review. Jadilah yang pertama!</p>
          ) : (
            <div className="mt-5 space-y-3">
              {reviews.map((review) => (
                <div key={review._id} className="rounded-3xl border border-clay/70 bg-white p-4 shadow-card sm:p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-saffron-400 to-saffron-500 text-xs font-bold text-linen">
                        {review.user?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-char">{review.user?.name || 'Pengguna'}</p>
                        <div className="mt-0.5 flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span key={i} className={i <= review.rating ? 'text-saffron-500' : 'text-clay'}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {user && review.user?._id === user._id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-char-faint transition-colors hover:text-basil-500"
                        aria-label="Hapus review"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-char-soft">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
