// src/components/RatingStars.jsx
import { StarFilledIcon } from './Icons.jsx'

export default function RatingStars({ rating = 0, reviewCount, size = 'sm' }) {
  const starSize = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5'
  const rounded = Math.round(rating)

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarFilledIcon
            key={i}
            className={`${starSize} ${i <= rounded ? 'text-saffron-500' : 'text-clay'}`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-char">{rating > 0 ? rating.toFixed(1) : 'Baru'}</span>
      {typeof reviewCount === 'number' && (
        <span className="text-xs text-char-faint">({reviewCount})</span>
      )}
    </div>
  )
}
