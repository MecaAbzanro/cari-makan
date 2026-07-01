// src/components/ProtectedRoute.jsx
// Membungkus route yang wajib login (review, favorite, order, profile, admin).
// Kalau belum login, redirect ke /login sambil menyimpan halaman tujuan asal
// di state navigasi, supaya setelah login berhasil bisa diarahkan balik ke sana.
// Prop `requiredRole` opsional — kalau diisi (mis. "admin"), user yang sudah
// login tapi role-nya tidak cocok akan melihat halaman "Akses Ditolak".
import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ShieldIcon } from './Icons.jsx'

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-basil-300 border-t-basil-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Cek role jika requiredRole ditentukan
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-basil-50">
          <ShieldIcon className="h-8 w-8 text-basil-500" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-char">Akses Ditolak</h1>
        <p className="mt-2 max-w-sm text-sm text-char-soft">
          Halaman ini hanya bisa diakses oleh <span className="font-semibold text-basil-600">{requiredRole}</span>. Akunmu tidak memiliki izin yang diperlukan.
        </p>
        <Link to="/" className="btn-primary mt-6">
          Kembali ke Beranda
        </Link>
      </div>
    )
  }

  return children
}

