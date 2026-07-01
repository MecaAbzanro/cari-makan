// src/pages/admin/AdminUsers.jsx
// Halaman admin untuk melihat daftar semua user dan mengubah role (user ↔ admin).
import { useEffect, useState } from 'react'
import { fetchAllUsers, updateUserRole } from '../../api/adminApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import LoadingState from '../../components/LoadingState.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { UsersIcon, PackageIcon, ShieldIcon, UserIcon } from '../../components/Icons.jsx'
import { toast } from 'react-toastify'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    fetchAllUsers()
      .then(setUsers)
      .catch(() => toast.error('Gagal memuat daftar user'))
      .finally(() => setLoading(false))
  }, [])

  async function handleToggleRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const label = newRole === 'admin' ? 'menjadi admin' : 'menjadi user biasa'

    if (!window.confirm(`Ubah role user ini ${label}?`)) return

    setUpdatingId(userId)
    try {
      const updated = await updateUserRole(userId, newRole)
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: updated.role } : u)))
      toast.success(`Role berhasil diubah ${label}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah role')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-char sm:text-3xl">
          <UsersIcon className="h-6 w-6 text-basil-500" /> Kelola Users
        </h1>
        <p className="mt-1 text-sm text-char-soft">
          Lihat daftar user terdaftar dan ubah role mereka.
        </p>
      </div>

      {loading && <LoadingState />}

      {!loading && users.length === 0 && (
        <EmptyState
          icon={PackageIcon}
          title="Belum ada user"
          description="Belum ada user yang terdaftar."
        />
      )}

      {!loading && users.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-clay/70 bg-white shadow-card">
          {/* Header desktop */}
          <div className="hidden grid-cols-[2fr_2fr_1fr_1fr_auto] gap-3 border-b border-clay bg-linen-soft px-5 py-3 text-xs font-semibold uppercase tracking-wide text-char-faint sm:grid">
            <span>Nama</span>
            <span>Email</span>
            <span>Role</span>
            <span>Terdaftar</span>
            <span className="text-right">Aksi</span>
          </div>

          {users.map((u) => {
            const isSelf = currentUser?._id === u._id
            return (
              <div
                key={u._id}
                className="grid grid-cols-1 gap-2 border-b border-clay px-5 py-4 last:border-b-0 sm:grid-cols-[2fr_2fr_1fr_1fr_auto] sm:items-center sm:gap-3"
              >
                {/* Nama + avatar */}
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-saffron-400 to-saffron-500 text-xs font-bold text-linen">
                    {u.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-char">
                      {u.name}
                      {isSelf && <span className="ml-1.5 text-xs font-normal text-char-faint">(kamu)</span>}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <span className="truncate text-sm text-char-soft">{u.email}</span>

                {/* Role badge */}
                <div>
                  {u.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-basil-50 px-2.5 py-1 text-xs font-semibold text-basil-700">
                      <ShieldIcon className="h-3 w-3" /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-linen-soft px-2.5 py-1 text-xs font-semibold text-char-soft">
                      <UserIcon className="h-3 w-3" /> User
                    </span>
                  )}
                </div>

                {/* Tanggal daftar */}
                <span className="text-xs text-char-soft">
                  {new Date(u.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>

                {/* Toggle role button */}
                <div className="flex items-center sm:justify-end">
                  {isSelf ? (
                    <span className="text-xs text-char-faint">—</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleRole(u._id, u.role)}
                      disabled={updatingId === u._id}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all disabled:cursor-wait disabled:opacity-60 ${
                        u.role === 'admin'
                          ? 'border-basil-200 bg-basil-50 text-basil-700 hover:bg-basil-100'
                          : 'border-basil-200 bg-basil-50 text-basil-700 hover:bg-basil-100'
                      }`}
                    >
                      {u.role === 'admin' ? 'Turunkan ke User' : 'Jadikan Admin'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
