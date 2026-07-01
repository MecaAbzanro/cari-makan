// src/pages/admin/MenuManager.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchRestaurantById } from '../../api/restaurantApi.js'
import { fetchMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../../api/menuApi.js'
import EmptyState from '../../components/EmptyState.jsx'
import { ChevronLeftIcon, PlusIcon, EditIcon, TrashIcon, PackageIcon } from '../../components/Icons.jsx'
import { formatRupiah } from '../../utils/format.js'
import { toast } from 'react-toastify'

const EMPTY_ITEM = { name: '', description: '', price: '', image: '', category: 'Makanan Utama', isAvailable: true }

export default function MenuManager() {
  const { restaurantId } = useParams()

  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_ITEM)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([fetchRestaurantById(restaurantId), fetchMenuItems(restaurantId)])
      .then(([detail, items]) => {
        setRestaurant(detail.restaurant)
        setMenuItems(items)
      })
      .catch(() => toast.error('Gagal memuat data menu'))
      .finally(() => setLoading(false))
  }, [restaurantId])

  function openCreateForm() {
    setForm(EMPTY_ITEM)
    setEditingId(null)
    setShowForm(true)
  }

  function openEditForm(item) {
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      image: item.image || '',
      category: item.category,
      isAvailable: item.isAvailable,
    })
    setEditingId(item._id)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { ...form, price: Number(form.price) }
      if (editingId) {
        const updated = await updateMenuItem(editingId, payload)
        setMenuItems((prev) => prev.map((m) => (m._id === editingId ? updated : m)))
        toast.success('Menu berhasil diperbarui')
      } else {
        const created = await createMenuItem(restaurantId, payload)
        setMenuItems((prev) => [...prev, created])
        toast.success('Menu berhasil ditambahkan')
      }
      setShowForm(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan menu')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(itemId, name) {
    if (!window.confirm(`Hapus menu "${name}"?`)) return
    try {
      await deleteMenuItem(itemId)
      setMenuItems((prev) => prev.filter((m) => m._id !== itemId))
      toast.success('Menu berhasil dihapus')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus menu')
    }
  }

  if (loading) {
    return (
      <div className="container-page py-8">
        <div className="skeleton h-64 w-full rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-char-soft hover:text-basil-500">
        <ChevronLeftIcon className="h-4 w-4" /> Kembali ke daftar restoran
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-char">Menu — {restaurant?.name}</h1>
        <button type="button" onClick={openCreateForm} className="btn-primary">
          <PlusIcon className="h-4 w-4" /> Tambah Menu
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4 rounded-3xl border border-clay/70 bg-white p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-char">
            {editingId ? 'Edit Menu' : 'Tambah Menu Baru'}
          </h2>

          <div>
            <label className="mb-1 block text-xs font-semibold text-char-soft">Nama Menu</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-char-soft">Deskripsi (opsional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              maxLength={500}
              className="input-field resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-char-soft">Harga (Rp)</label>
              <input
                type="number"
                required
                min={0}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="input-field"
                placeholder="25000"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-char-soft">Kategori Menu</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="input-field"
                placeholder="Makanan Utama, Minuman, dll"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-char-soft">URL Gambar (opsional)</label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              className="input-field"
              placeholder="https://..."
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-char">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
              className="h-4 w-4 rounded border-clay text-basil-500 focus:ring-basil-400"
            />
            Tersedia untuk dipesan
          </label>

          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Menu'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="mt-6">
        {menuItems.length === 0 ? (
          <EmptyState
            icon={PackageIcon}
            title="Belum ada menu"
            description='Klik "Tambah Menu" untuk mulai menambahkan menu restoran ini.'
          />
        ) : (
          <div className="space-y-2">
            {menuItems.map((item) => (
              <div key={item._id} className="flex items-center gap-3 rounded-2xl border border-clay/70 bg-white p-3 shadow-card">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-linen-soft">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-char-faint">
                      <PackageIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-char">{item.name}</h3>
                    {!item.isAvailable && (
                      <span className="chip bg-clay text-char-soft">Tidak Tersedia</span>
                    )}
                  </div>
                  <p className="text-xs text-char-faint">{item.category}</p>
                  <p className="text-sm font-semibold text-basil-600">{formatRupiah(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(item)}
                    className="grid h-8 w-8 place-items-center rounded-full border border-clay text-char-soft transition-colors hover:border-basil-400 hover:text-basil-500"
                    aria-label="Edit menu"
                  >
                    <EditIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id, item.name)}
                    className="grid h-8 w-8 place-items-center rounded-full border border-clay text-char-soft transition-colors hover:border-basil-400 hover:text-basil-500"
                    aria-label="Hapus menu"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
