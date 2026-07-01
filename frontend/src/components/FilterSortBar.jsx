// src/components/FilterSortBar.jsx
import { useState } from 'react'
import { FilterIcon, ChevronDownIcon } from './Icons.jsx'

const PRICE_OPTIONS = [
  { value: '', label: 'Semua harga' },
  { value: 'murah', label: 'Murah' },
  { value: 'sedang', label: 'Sedang' },
  { value: 'mahal', label: 'Mahal' },
]

const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating tertinggi' },
  { value: 'price', label: 'Termurah' },
  { value: 'nearest', label: 'Terdekat' },
  { value: 'newest', label: 'Terbaru' },
]

const RATING_OPTIONS = [
  { value: '', label: 'Semua rating' },
  { value: '4.5', label: '4.5+' },
  { value: '4', label: '4.0+' },
  { value: '3', label: '3.0+' },
]

export default function FilterSortBar({ filters, onChange, onRequestLocation, locationStatus }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleSortChange(value) {
    if (value === 'nearest' && locationStatus !== 'granted') {
      onRequestLocation()
    }
    onChange({ ...filters, sort: value })
  }

  return (
    <div className="rounded-3xl border border-clay/70 bg-white p-4 shadow-card">
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="flex w-full items-center justify-between sm:hidden"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-char">
          <FilterIcon className="h-4 w-4 text-basil-500" /> Filter & Urutkan
        </span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
      </button>

      <div className={`${mobileOpen ? 'mt-4 grid' : 'hidden'} gap-3 sm:mt-0 sm:grid sm:grid-cols-3 sm:gap-3`}>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-char-faint">💰 Tingkat Harga</label>
          <select
            value={filters.priceLevel}
            onChange={(e) => onChange({ ...filters, priceLevel: e.target.value })}
            className="input-field"
          >
            {PRICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-char-faint">⭐ Rating Minimum</label>
          <select
            value={filters.minRating}
            onChange={(e) => onChange({ ...filters, minRating: e.target.value })}
            className="input-field"
          >
            {RATING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-char-faint">↕️ Urutkan</label>
          <select
            value={filters.sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="input-field"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {filters.sort === 'nearest' && locationStatus === 'denied' && (
            <p className="mt-1 text-[11px] text-basil-600">
              Izin lokasi ditolak — urutan terdekat tidak bisa dipakai.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
