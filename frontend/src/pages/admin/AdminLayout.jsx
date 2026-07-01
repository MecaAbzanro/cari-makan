// src/pages/admin/AdminLayout.jsx
// Layout wrapper untuk semua halaman admin. Berisi sidebar navigasi dan area
// konten utama. Sidebar collapse di mobile (toggle dengan tombol hamburger).
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  BarChartIcon,
  GridIcon,
  ClipboardIcon,
  UsersIcon,
  MenuIcon,
  XIcon,
} from '../../components/Icons.jsx'

const NAV_ITEMS = [
  { to: '/admin', icon: BarChartIcon, label: 'Dashboard', end: true },
  { to: '/admin/restoran', icon: GridIcon, label: 'Restoran', end: false },
  { to: '/admin/pesanan', icon: ClipboardIcon, label: 'Pesanan', end: false },
  { to: '/admin/users', icon: UsersIcon, label: 'Users', end: false },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="container-page flex min-h-[calc(100vh-72px)] gap-0 lg:gap-6">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-char/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Tutup sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-clay/70 bg-white pt-[72px] shadow-glow transition-transform duration-300 lg:static lg:z-auto lg:w-56 lg:shrink-0 lg:translate-x-0 lg:border-r-0 lg:bg-transparent lg:pt-0 lg:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-clay/50 px-5 py-4 lg:hidden">
          <span className="font-display text-sm font-bold text-char">Admin Panel</span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-full text-char-soft hover:bg-linen-soft"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4 lg:sticky lg:top-[88px]">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-char-faint">
            Menu Admin
          </p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-basil-500 to-basil-600 text-linen shadow-glow'
                    : 'text-char-soft hover:bg-linen-soft hover:text-basil-600'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Konten utama */}
      <div className="flex-1 py-6 lg:py-8">
        {/* Tombol hamburger mobile */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="mb-4 inline-flex items-center gap-2 rounded-xl border border-clay bg-white px-3 py-2 text-sm font-medium text-char-soft shadow-sm transition-colors hover:border-basil-400 hover:text-basil-500 lg:hidden"
        >
          <MenuIcon className="h-4 w-4" />
          Menu Admin
        </button>

        <Outlet />
      </div>
    </div>
  )
}
