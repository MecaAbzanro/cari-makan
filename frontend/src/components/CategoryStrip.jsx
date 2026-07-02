// src/components/CategoryStrip.jsx
const CATEGORY_IMAGE = {
  nusantara: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=500&auto=format&fit=crop',
  padang: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=500&auto=format&fit=crop',
  sunda: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=500&auto=format&fit=crop',
  chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=500&auto=format&fit=crop',
  western: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&auto=format&fit=crop',
  seafood: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?q=80&w=500&auto=format&fit=crop',
  minuman: 'https://images.unsplash.com/photo-1534057308991-b9b3a578f1b1?q=80&w=500&auto=format&fit=crop',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500&auto=format&fit=crop',
  bakso: 'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=500&auto=format&fit=crop',
  'bakso & mie': 'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=500&auto=format&fit=crop',
  sate: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=500&auto=format&fit=crop',
  ayam: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=500&auto=format&fit=crop',
  'sehat & diet': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500&auto=format&fit=crop',
  dessert: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=500&auto=format&fit=crop',
  kopi: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=500&auto=format&fit=crop',
  roti: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=500&auto=format&fit=crop',
  jepang: 'https://images.unsplash.com/photo-1580822184713-3644c52898b6?q=80&w=500&auto=format&fit=crop',
  korea: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?q=80&w=500&auto=format&fit=crop',
  'street food': 'https://images.unsplash.com/photo-1621644782046-646736284606?q=80&w=500&auto=format&fit=crop',
  semua: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=500&auto=format&fit=crop',
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=500&auto=format&fit=crop'

function imageFor(category) {
  return CATEGORY_IMAGE[category.toLowerCase()] || FALLBACK_IMAGE
}

/**
 * Menampilkan daftar kategori makanan sebagai strip scroll horizontal.
 *
 * @param {string[]} categories  - Daftar nama kategori dari backend.
 * @param {string}   active      - Kategori yang sedang dipilih ('' = semua).
 * @param {Function} onSelect    - Callback dipanggil dengan string kategori saat user klik.
 */
export default function CategoryStrip({ categories, active, onSelect }) {
  // Tambahkan 'Semua' sebagai kategori pertama
  const allCategories = ['', ...categories]

  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
      {allCategories.map((cat) => {
        const isActive = active === cat
        const label = cat === '' ? 'Semua' : cat
        const imgKey = cat === '' ? 'semua' : cat

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className="group flex w-[80px] shrink-0 flex-col items-center gap-2 transition-all active:scale-95 sm:w-[90px]"
          >
            <div
              className={`flex shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                isActive
                  ? 'h-[72px] w-[72px] border-[2.5px] border-basil-500 p-[3px] shadow-sm sm:h-[80px] sm:w-[80px]'
                  : 'h-[64px] w-[64px] border border-clay/50 p-[2px] group-hover:border-basil-300 group-hover:shadow-sm sm:h-[72px] sm:w-[72px]'
              }`}
            >
              <div className="h-full w-full overflow-hidden rounded-full bg-linen-soft">
                <img
                  src={imageFor(imgKey)}
                  alt={label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>
            <span
              className={`text-center text-xs transition-colors duration-300 sm:text-sm ${
                isActive ? 'font-bold text-basil-600' : 'font-medium text-char-soft group-hover:text-char'
              }`}
            >
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
