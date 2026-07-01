// src/pages/admin/RestaurantForm.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchRestaurantById, createRestaurant, updateRestaurant } from '../../api/restaurantApi.js'
import { ChevronLeftIcon } from '../../components/Icons.jsx'
import { toast } from 'react-toastify'

const EMPTY_FORM = {
  name: '',
  description: '',
  address: '',
  city: '',
  category: '',
  priceLevel: 'sedang',
  image: '',
  openingHours: '08:00 - 22:00',
}

export default function RestaurantForm() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isEditMode) return
    fetchRestaurantById(id)
      .then(({ restaurant }) => {
        setForm({
          name: restaurant.name,
          description: restaurant.description,
          address: restaurant.address,
          city: restaurant.city,
          category: restaurant.category,
          priceLevel: restaurant.priceLevel,
          image: restaurant.image,
          openingHours: restaurant.openingHours,
        })
      })
      .catch(() => toast.error('Gagal memuat data restoran'))
      .finally(() => setLoading(false))
  }, [id, isEditMode])

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (isEditMode) {
        await updateRestaurant(id, form)
        toast.success('Restoran berhasil diperbarui')
      } else {
        await createRestaurant(form)
        toast.success('Restoran berhasil ditambahkan')
      }
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan restoran')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container-page py-8">
        <div className="skeleton h-96 w-full max-w-2xl rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-char-soft hover:text-basil-500">
        <ChevronLeftIcon className="h-4 w-4" /> Kembali ke daftar restoran
      </Link>

      <h1 className="mt-3 font-display text-2xl font-bold text-char">
        {isEditMode ? 'Edit Restoran' : 'Tambah Restoran Baru'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4 rounded-3xl border border-clay/70 bg-white p-6 shadow-card">
        <div>
          <label className="mb-1 block text-xs font-semibold text-char-soft">Nama Restoran</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="input-field"
            placeholder="Mis. Warung Nasi Padang Sederhana"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-char-soft">Deskripsi</label>
          <textarea
            required
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            maxLength={1000}
            className="input-field resize-none"
            placeholder="Ceritakan singkat tentang restoran ini..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-char-soft">Alamat</label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="input-field"
              placeholder="Jl. Contoh No. 1"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-char-soft">Kota</label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="input-field"
              placeholder="Mis. Bandar Lampung"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-char-soft">Kategori</label>
            <input
              type="text"
              required
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="input-field"
              placeholder="Mis. Seafood, Padang, Pizza"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-char-soft">Tingkat Harga</label>
            <select
              value={form.priceLevel}
              onChange={(e) => handleChange('priceLevel', e.target.value)}
              className="input-field"
            >
              <option value="murah">Murah</option>
              <option value="sedang">Sedang</option>
              <option value="mahal">Mahal</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-char-soft">URL Gambar</label>
          <input
            type="url"
            required
            value={form.image}
            onChange={(e) => handleChange('image', e.target.value)}
            className="input-field"
            placeholder="https://..."
          />
          {form.image && (
            <div className="mt-2 h-32 w-full overflow-hidden rounded-xl bg-linen-soft">
              <img src={form.image} alt="Pratinjau" className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-char-soft">Jam Buka</label>
          <input
            type="text"
            value={form.openingHours}
            onChange={(e) => handleChange('openingHours', e.target.value)}
            className="input-field"
            placeholder="08:00 - 22:00"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Restoran'}
        </button>
      </form>
    </div>
  )
}
