import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, ChefHat } from '../components/Icons.jsx'
import { toast } from 'react-toastify'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const result = await login(form)
    setSubmitting(false)

    if (result.success) {
      toast.success('Berhasil masuk!')
      navigate(from, { replace: true })
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-72px)] w-full items-center justify-center py-12 px-4 sm:px-6">
      {/* Background with Image and Blur */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
          alt="Background"
          className="h-full w-full object-cover brightness-[0.3]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
      </div>

      {/* Centered Form Card */}
      <div className="relative z-10 w-full max-w-[420px] animate-scaleIn rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10 border border-white/20">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-basil-600 text-white shadow-md">
            <ChefHat className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-char sm:text-3xl">Selamat Datang</h1>
          <p className="mt-2 text-sm text-char-soft">
            Masuk untuk lanjut memesan makanan favoritmu.
          </p>
        </div>

        {/* Dummy Social Login */}
        <button
          type="button"
          onClick={() => toast.info('Fitur login dengan Google segera hadir!')}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-clay bg-white py-3 text-sm font-bold text-char shadow-sm transition-all hover:border-basil-400 hover:bg-linen-soft"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
          Lanjutkan dengan Google
        </button>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-clay/70"></div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-char-faint">Atau dengan email</span>
          <div className="h-px flex-1 bg-clay/70"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-char-soft">Email</label>
            <div className="relative">
              <MailIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-char-faint" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="nama@email.com"
                className="w-full rounded-2xl border border-clay/80 bg-linen-soft py-3 pl-12 pr-4 text-[15px] text-char transition-colors placeholder:text-char-soft focus:border-basil-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-basil-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-char-soft">Password</label>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-char-faint" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-clay/80 bg-linen-soft py-3 pl-12 pr-12 text-[15px] text-char transition-colors placeholder:text-char-soft focus:border-basil-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-basil-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-char-faint transition-colors hover:text-char"
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="mt-2 w-full rounded-full bg-basil-600 py-3.5 text-[15px] font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70">
            {submitting ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        <p className="mt-6 text-center text-[14px] text-char-soft">
          Belum punya akun?{' '}
          <Link to="/register" className="font-bold text-basil-600 transition-colors hover:text-basil-700 hover:underline">
            Daftar di sini
          </Link>
        </p>

      </div>
    </div>
  )
}
