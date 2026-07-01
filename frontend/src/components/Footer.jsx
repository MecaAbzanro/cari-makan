// src/components/Footer.jsx
import { Link } from 'react-router-dom'
import { FiInstagram, FiPhone, FiMail, FiMapPin } from 'react-icons/fi'

const ChefHat = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
    <line x1="6" y1="17" x2="18" y2="17" />
  </svg>
)

const XLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#242b22] text-[#a5b09e]">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[2fr_1fr_1fr_1.5fr]">
        
        {/* Kolom 1: Logo & Deskripsi */}
        <div className="pr-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5e6f4e] text-white">
              <ChefHat className="h-6 w-6" />
            </div>
            <p className="font-display text-2xl font-bold tracking-wide text-white">
              Cari<span className="text-[#5e6f4e]">Makan</span>
            </p>
          </div>
          <p className="mt-6 text-sm leading-relaxed">
            Platform terpercaya untuk<br/>menemukan restoran dan<br/>kuliner terbaik di seluruh<br/>Indonesia.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="#" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
              <FiInstagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="X (Twitter)" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
              <XLogo className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Kolom 2: Jelajahi */}
        <div>
          <p className="font-semibold text-white">Jelajahi</p>
          <ul className="mt-6 space-y-4 text-sm">
            <li><Link to="/cari" className="transition-colors hover:text-white">Cari Restoran</Link></li>
            <li><Link to="/cari?q=Indonesia" className="transition-colors hover:text-white">Masakan Indonesia</Link></li>
            <li><Link to="/cari?q=Seafood" className="transition-colors hover:text-white">Seafood</Link></li>
            <li><Link to="/cari?q=Jepang" className="transition-colors hover:text-white">Masakan Jepang</Link></li>
            <li><Link to="/cari?priceLevel=murah" className="transition-colors hover:text-white">Makanan Murah</Link></li>
          </ul>
        </div>

        {/* Kolom 3: Akun */}
        <div>
          <p className="font-semibold text-white">Akun</p>
          <ul className="mt-6 space-y-4 text-sm">
            <li><Link to="/register" className="transition-colors hover:text-white">Daftar Gratis</Link></li>
            <li><Link to="/login" className="transition-colors hover:text-white">Masuk</Link></li>
            <li><Link to="/profil" className="transition-colors hover:text-white">Profil</Link></li>
            <li><Link to="/favorit" className="transition-colors hover:text-white">Restoran Favorit</Link></li>
            <li><Link to="/admin" className="transition-colors hover:text-white">Admin Panel</Link></li>
          </ul>
        </div>

        {/* Kolom 4: Kontak */}
        <div>
          <p className="font-semibold text-white">Kontak</p>
          <ul className="mt-6 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <FiMapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#5e6f4e]" />
              <span>Jakarta, Indonesia</span>
            </li>
            <li className="flex items-center gap-3">
              <FiPhone className="h-5 w-5 shrink-0 text-[#5e6f4e]" />
              <span>+62 812 3456 7890</span>
            </li>
            <li className="flex items-center gap-3">
              <FiMail className="h-5 w-5 shrink-0 text-[#5e6f4e]" />
              <span>hello@carimakan.id</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-page border-t border-white/10 py-6 text-xs sm:flex sm:items-center sm:justify-between">
        <p>© 2024 CariMakan. Hak cipta dilindungi.</p>
        <div className="mt-4 flex gap-6 sm:mt-0">
          <a href="#" className="transition-colors hover:text-white">Kebijakan Privasi</a>
          <a href="#" className="transition-colors hover:text-white">Syarat & Ketentuan</a>
        </div>
      </div>
    </footer>
  )
}
