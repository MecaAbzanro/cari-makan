// src/components/Header.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { SearchIcon, CartIcon, HeartIcon, UserIcon, LogOutIcon, GridIcon, ClipboardIcon, ChefHat } from './Icons.jsx'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/cari?q=${encodeURIComponent(query.trim())}`)
    setQuery('')
  }

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-clay/70 bg-linen/85 shadow-sm backdrop-blur-md">
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-2.5 transition-transform active:scale-95">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-basil-600 text-white shadow-sm transition-colors group-hover:bg-basil-700">
              <ChefHat className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-char">
              Cari<span className="text-basil-600">Makan</span>
            </span>
          </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 max-w-lg items-center sm:flex">
          <div className="relative w-full">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-char-faint" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari restoran, masakan favoritmu..."
              className="w-full rounded-full border border-clay/50 bg-linen-soft py-3 pl-11 pr-4 text-sm text-char shadow-sm transition-all placeholder:text-char-faint hover:border-clay focus:border-basil-400 focus:bg-white focus:shadow-soft focus:outline-none"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/cari"
            className="grid h-10 w-10 place-items-center rounded-full text-char-soft transition-colors hover:bg-linen-soft hover:text-basil-500 sm:hidden"
            aria-label="Cari"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>

          {isAuthenticated && (
            <Link
              to="/favorit"
              className="hidden h-10 w-10 place-items-center rounded-full text-char-soft transition-colors hover:bg-linen-soft hover:text-basil-500 sm:grid"
              aria-label="Favorit"
            >
              <HeartIcon className="h-5 w-5" />
            </Link>
          )}

          <Link
            to="/keranjang"
            className="relative grid h-10 w-10 place-items-center rounded-full text-char-soft transition-colors hover:bg-linen-soft hover:text-basil-500"
            aria-label="Keranjang"
          >
            <CartIcon className="h-5 w-5" />
            {itemCount > 0 && (
              <span
                key={itemCount}
                className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 animate-popIn place-items-center rounded-full bg-gradient-to-br from-basil-500 to-basil-600 px-1 text-[10px] font-bold text-linen shadow-sm"
              >
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="ml-1 flex h-10 items-center gap-2 rounded-full border border-clay bg-white px-3 text-sm font-semibold text-char shadow-sm transition-all hover:border-basil-400 hover:shadow-soft"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-basil-500 to-basil-600 text-xs font-bold text-linen">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="hidden max-w-[100px] truncate sm:inline">{user?.name}</span>
              </button>

              {menuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Tutup menu"
                  />
                  <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-clay/70 bg-white py-1.5 shadow-glow animate-popIn">
                    <Link to="/profil" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-char transition-colors hover:bg-linen-soft hover:text-basil-600">
                      <UserIcon className="h-4 w-4" /> Profil Saya
                    </Link>
                    <Link to="/pesanan" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-char transition-colors hover:bg-linen-soft hover:text-basil-600">
                      <ClipboardIcon className="h-4 w-4" /> Pembelian
                    </Link>
                    <Link to="/favorit" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-char transition-colors hover:bg-linen-soft hover:text-basil-600 sm:hidden">
                      <HeartIcon className="h-4 w-4" /> Favorit
                    </Link>
                    {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-char transition-colors hover:bg-linen-soft hover:text-basil-600">
                      <GridIcon className="h-4 w-4" /> Kelola Restoran
                    </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 border-t border-clay px-4 py-2.5 text-left text-sm text-basil-600 transition-colors hover:bg-basil-50"
                    >
                      <LogOutIcon className="h-4 w-4" /> Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary ml-1 !px-4 !py-2 text-xs sm:!px-5 sm:!py-2.5 sm:text-sm">
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
