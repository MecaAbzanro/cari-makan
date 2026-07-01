// src/components/RestaurantCard.jsx
import { Link } from 'react-router-dom'
import { useState } from 'react'
import RatingStars from './RatingStars.jsx'
import { MapPinIcon, HeartIcon } from './Icons.jsx'
import { PRICE_LEVEL_LABEL } from '../utils/format.js'

export default function RestaurantCard({ restaurant, isFavorite, onToggleFavorite }) {
  const { _id, name, image, category, city, priceLevel, rating, reviewCount, distanceKm } = restaurant
  const [justToggled, setJustToggled] = useState(false)

  function handleFavoriteClick(e) {
    e.preventDefault()
    setJustToggled(true)
    onToggleFavorite(_id)
    setTimeout(() => setJustToggled(false), 650)
  }

  return (
    <div className="card-premium group relative animate-fadeUp overflow-hidden">
      <Link to={`/restoran/${_id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-linen-soft">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
          {/* Overlay gradient halus supaya badge & teks tetap terbaca di atas foto apa pun */}
          <div className="absolute inset-0 bg-gradient-to-t from-char/35 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-90" />

          <span className="absolute left-3 top-3 chip bg-white/95 text-char shadow-soft backdrop-blur">
            {category}
          </span>
          {typeof distanceKm === 'number' && (
            <span className="absolute bottom-3 right-3 chip bg-char/85 text-linen backdrop-blur">
              {distanceKm} km
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-display text-base font-semibold leading-tight text-char truncate transition-colors group-hover:text-basil-600">
            {name}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-char-soft">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{city}</span>
          </p>
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
            <RatingStars rating={rating} reviewCount={reviewCount} />
            <span className="chip bg-basil-50 text-basil-700 whitespace-nowrap">{PRICE_LEVEL_LABEL[priceLevel] || priceLevel}</span>
          </div>
        </div>
      </Link>

      {onToggleFavorite && (
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
          className={`heart-btn absolute right-3 top-3 ${justToggled ? 'is-active' : ''}`}
        >
          <HeartIcon className={`h-4 w-4 transition-colors ${isFavorite ? 'fill-basil-500 text-basil-500' : 'text-char-soft'}`} />
        </button>
      )}
    </div>
  )
}
