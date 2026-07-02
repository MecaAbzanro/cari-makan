// src/pages/Cart.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { createOrder } from '../api/orderApi.js'
import EmptyState from '../components/EmptyState.jsx'
import { PackageIcon, PlusIcon, MinusIcon, TrashIcon, CheckCircleIcon } from '../components/Icons.jsx'
import { formatRupiah } from '../utils/format.js'
import { toast } from 'react-toastify'

export default function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const {
    restaurantId,
    restaurantName,
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    updateQty,
    removeItem,
    clearCart,
  } = useCart()

  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [submitting, setSubmitting] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)

  async function handleCheckout(e) {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.info('Silakan masuk dulu untuk membuat pesanan')
      navigate('/login')
      return
    }
    if (!address.trim()) {
      toast.error('Alamat pengiriman wajib diisi')
      return
    }

    setSubmitting(true)
    try {
      const order = await createOrder({
        restaurant: restaurantId,
        items: items.map((i) => ({ menuItem: i.menuItemId, quantity: i.quantity })),
        deliveryAddress: address.trim(),
        notes: notes.trim(),
        paymentMethod,
      })
      setCompletedOrder(order)
      clearCart()
      toast.success('Pesanan berhasil dibuat!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat pesanan')
    } finally {
      setSubmitting(false)
    }
  }

  if (completedOrder) {
    return (
      <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
        <div className="w-full max-w-md animate-scaleIn rounded-3xl border border-clay/70 bg-white p-8 text-center shadow-glow">
          <div className="mx-auto grid h-16 w-16 animate-popIn place-items-center rounded-full bg-gradient-to-br from-basil-50 to-basil-100 text-basil-500">
            <CheckCircleIcon className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-char">Pesanan Berhasil!</h1>
          <p className="mt-2 text-sm text-char-soft">
            Pesananmu sedang diproses. Total pembayaran{' '}
            <span className="font-semibold text-char">{formatRupiah(completedOrder.total)}</span>.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => navigate('/pesanan')} className="btn-primary">
              Lihat Riwayat Pesanan
            </button>
            <button type="button" onClick={() => navigate('/')} className="btn-secondary">
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={PackageIcon}
          title="Keranjangmu masih kosong"
          description="Yuk, jelajahi restoran dan tambahkan menu favoritmu ke keranjang."
          action={
            <button type="button" onClick={() => navigate('/cari')} className="btn-primary mt-2">
              Cari Restoran
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-2xl font-bold text-char sm:text-3xl">Keranjang</h1>
      <p className="mt-1 text-sm text-char-soft">Pesanan dari {restaurantName}</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <div key={item.menuItemId} className="flex items-center gap-3 rounded-2xl border border-clay/70 bg-white p-3 shadow-card">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-linen-soft">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-char-faint">
                    <PackageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-char">{item.name}</h3>
                <p className="mt-0.5 text-sm font-semibold text-basil-600">{formatRupiah(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQty(item.menuItemId, item.quantity - 1)}
                  className="grid h-7 w-7 place-items-center rounded-full border border-clay text-char transition-colors hover:border-basil-400"
                  aria-label="Kurangi"
                >
                  <MinusIcon className="h-3 w-3" />
                </button>
                <span className="w-5 text-center text-sm font-semibold text-char">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQty(item.menuItemId, item.quantity + 1)}
                  className="grid h-7 w-7 place-items-center rounded-full border border-clay text-char transition-colors hover:border-basil-400"
                  aria-label="Tambah"
                >
                  <PlusIcon className="h-3 w-3" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.menuItemId)}
                className="text-char-faint transition-colors hover:text-basil-500"
                aria-label="Hapus item"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleCheckout} className="h-fit rounded-3xl border border-clay/70 bg-white p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-char">Ringkasan Pesanan</h2>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-char-soft">
              <span>Subtotal ({itemCount} item)</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-char-soft">
              <span>Ongkos Kirim</span>
              <span>{deliveryFee === 0 ? 'Gratis' : formatRupiah(deliveryFee)}</span>
            </div>
            {deliveryFee > 0 && (
              <p className="text-xs text-saffron-600">
                Belanja {formatRupiah(75000 - subtotal)} lagi untuk gratis ongkir!
              </p>
            )}
            <div className="flex justify-between border-t border-clay pt-2 text-base font-semibold text-char">
              <span>Total</span>
              <span>{formatRupiah(total)}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-xs font-semibold text-char-soft">Alamat Pengiriman</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Contoh No. 123, Kota..."
              rows={2}
              required
              className="input-field resize-none"
            />
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-xs font-semibold text-char-soft">Metode Pembayaran</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="input-field"
            >
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="transfer">Transfer Bank</option>
              <option value="ewallet">E-Wallet (GoPay/OVO/Dana)</option>
            </select>
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-xs font-semibold text-char-soft">Catatan (opsional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mis. tidak pakai sambal..."
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary mt-4 w-full">
            {submitting ? 'Memproses...' : `Pesan Sekarang — ${formatRupiah(total)}`}
          </button>
        </form>
      </div>
    </div>
  )
}
