// src/pages/Search.jsx
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { fetchRestaurants } from '../api/restaurantApi.js'
import { fetchFavorites, addFavorite, removeFavorite } from '../api/favoriteApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import RestaurantCard from '../components/RestaurantCard.jsx'
import FilterSortBar from '../components/FilterSortBar.jsx'
import LoadingState from '../components/LoadingState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { SearchIcon, CompassIcon, FilterIcon } from '../components/Icons.jsx'
import { toast } from 'react-toastify'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [queryInput, setQueryInput] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({
    priceLevel: searchParams.get('priceLevel') || '',
    minRating: searchParams.get('minRating') || '',
    sort: searchParams.get('sort') || 'rating',
  })
  const [coords, setCoords] = useState(null)
  const [locationStatus, setLocationStatus] = useState('idle') // idle | granted | denied

  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [favoriteIds, setFavoriteIds] = useState(new Set())

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('denied')
      toast.error('Browser kamu tidak mendukung geolokasi')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationStatus('granted')
      },
      () => {
        setLocationStatus('denied')
        toast.error('Izin lokasi ditolak. Urutan "Terdekat" butuh akses lokasi.')
      }
    )
  }, [])

  const [filterOpen, setFilterOpen] = useState(false)

  function handleSortChange(value) {
    if (value === 'nearest' && locationStatus !== 'granted') {
      requestLocation()
    }
    setFilters(prev => ({ ...prev, sort: value }))
  }

  // Sinkronkan ke URL supaya hasil pencarian bisa di-share/refresh tanpa hilang filter
  useEffect(() => {
    const params = {}
    if (queryInput) params.q = queryInput
    if (filters.priceLevel) params.priceLevel = filters.priceLevel
    if (filters.minRating) params.minRating = filters.minRating
    if (filters.sort && filters.sort !== 'rating') params.sort = filters.sort
    setSearchParams(params, { replace: true })
  }, [queryInput, filters, setSearchParams])

  // Dengarkan perubahan URL dari luar (misal klik link dari Footer)
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const p = searchParams.get('priceLevel') || ''
    setQueryInput(q)
    setFilters(f => ({ ...f, priceLevel: p }))
  }, [searchParams])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    const params = {
      q: queryInput,
      priceLevel: filters.priceLevel,
      minRating: filters.minRating,
      sort: filters.sort,
    }
    if (filters.sort === 'nearest' && coords) {
      params.lat = coords.lat
      params.lng = coords.lng
    }

    fetchRestaurants(params)
      .then((data) => {
        if (active) setRestaurants(data)
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Gagal memuat hasil pencarian')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [queryInput, filters, coords])

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set())
      return
    }
    fetchFavorites()
      .then((favs) => setFavoriteIds(new Set(favs.map((f) => f._id))))
      .catch(() => {})
  }, [isAuthenticated])

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
      } else {
        await addFavorite(restaurantId)
        setFavoriteIds((prev) => new Set(prev).add(restaurantId))
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui favorit')
    }
  }

  function handlePriceClick(priceText) {
    let level = ''
    if (priceText === '< Rp 50rb') level = 'murah'
    else if (priceText === 'Rp 50–100rb') level = 'sedang'
    else if (priceText === '> Rp 100rb') level = 'mahal'
    
    // Toggle off if already selected
    setFilters(f => ({ ...f, priceLevel: f.priceLevel === level ? '' : level }))
  }

  return (
    <div className="pb-8">
      {/* Unified Search & Filter Bar matched to screenshot */}
      <div className="border-b border-clay/50 bg-white py-4 shadow-sm mb-6">
        <div className="container-page">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-char-faint" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Cari restoran, masakan, atau menu..."
                className="w-full rounded-full bg-linen-soft py-2.5 pl-11 pr-4 text-[15px] text-char transition-colors placeholder:text-char-soft focus:bg-white focus:outline-none focus:ring-1 focus:ring-basil-400"
              />
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex h-[42px] items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors ${
                  filterOpen 
                    ? 'bg-basil-600 text-white' 
                    : 'border border-clay bg-white text-char hover:border-basil-400'
                }`}
              >
                <FilterIcon className="h-4 w-4" /> Filter
              </button>

              <select
                value={filters.sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="h-[42px] rounded-full border border-clay bg-white pl-4 pr-8 text-sm font-semibold text-char outline-none hover:border-basil-400 focus:border-basil-400 appearance-none bg-no-repeat"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%2352525b\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
              >
                <option value="rating">Rating Tertinggi</option>
                <option value="price">Termurah</option>
                <option value="nearest">Terdekat</option>
                <option value="newest">Terbaru</option>
              </select>
            </div>
          </div>

          {/* Expanded Filter Tags */}
          {filterOpen && (
            <div className="mt-4 animate-slideDown border-t border-clay/40 pt-4 pb-2">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="w-[72px] text-[11px] font-bold uppercase tracking-wider text-char-faint">Kategori:</span>
                {['Indonesia', 'Seafood', 'Jepang', 'Korea', 'Western', 'Vegetarian', 'Street Food', 'Bakery'].map(cat => {
                  const isActive = queryInput.toLowerCase() === cat.toLowerCase()
                  return (
                    <button 
                      key={cat} 
                      onClick={() => setQueryInput(isActive ? '' : cat)}
                      className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${isActive ? 'bg-basil-600 text-white' : 'bg-linen-soft text-char hover:bg-clay/50'}`}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-[72px] text-[11px] font-bold uppercase tracking-wider text-char-faint">Harga:</span>
                {['< Rp 50rb', 'Rp 50–100rb', '> Rp 100rb'].map(price => {
                  let level = price === '< Rp 50rb' ? 'murah' : price === 'Rp 50–100rb' ? 'sedang' : 'mahal'
                  const isActive = filters.priceLevel === level
                  return (
                    <button 
                      key={price} 
                      onClick={() => handlePriceClick(price)}
                      className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${isActive ? 'bg-basil-600 text-white' : 'bg-linen-soft text-char hover:bg-clay/50'}`}
                    >
                      {price}
                    </button>
                  )
                })}
                
                <span className="ml-2 w-[50px] text-[11px] font-bold uppercase tracking-wider text-char-faint">Kota:</span>
                {['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta'].map(city => {
                  const isActive = queryInput.toLowerCase() === city.toLowerCase()
                  return (
                    <button 
                      key={city} 
                      onClick={() => setQueryInput(isActive ? '' : city)}
                      className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${isActive ? 'bg-basil-600 text-white' : 'bg-linen-soft text-char hover:bg-clay/50'}`}
                    >
                      {city}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container-page">
        {loading && <LoadingState />}

        {!loading && error && <EmptyState icon={CompassIcon} title="Gagal memuat hasil" description={error} />}

        {!loading && !error && restaurants.length === 0 && (
          <EmptyState
            icon={CompassIcon}
            title="Tidak ada restoran ditemukan"
            description="Coba ubah kata kunci atau longgarkan filter pencarianmu."
          />
        )}

        {!loading && !error && restaurants.length > 0 && (
          <>
            <p className="mb-4 text-sm text-char-soft">{restaurants.length} restoran ditemukan</p>
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
          </>
        )}
      </div>
    </div>
  )
}
