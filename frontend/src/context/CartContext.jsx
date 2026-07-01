// src/context/CartContext.jsx
// Keranjang belanja selalu terikat ke SATU restoran (sesuai pola GoFood/
// ShopeeFood — tidak bisa checkout campur dari restoran berbeda dalam satu
// pesanan). Kalau user menambah menu dari restoran lain saat keranjang
// belum kosong, kita tanya dulu lewat confirm() apakah mau mengosongkan
// keranjang lama.
import { createContext, useContext, useReducer, useMemo } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'carimakan_cart'

function loadInitialCart() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { restaurantId: null, restaurantName: null, items: [] }
  } catch {
    return { restaurantId: null, restaurantName: null, items: [] }
  }
}

function persist(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // sessionStorage penuh/diblokir browser — abaikan, bukan kegagalan kritis
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { menuItem, restaurantId, restaurantName } = action.payload

      // Restoran berbeda dari isi keranjang saat ini → mulai keranjang baru.
      const isDifferentRestaurant = state.restaurantId && state.restaurantId !== restaurantId
      const baseItems = isDifferentRestaurant ? [] : state.items

      const existing = baseItems.find((i) => i.menuItemId === menuItem._id)
      const newItems = existing
        ? baseItems.map((i) => (i.menuItemId === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...baseItems, { menuItemId: menuItem._id, name: menuItem.name, price: menuItem.price, image: menuItem.image, quantity: 1 }]

      const next = { restaurantId, restaurantName, items: newItems }
      persist(next)
      return next
    }
    case 'UPDATE_QTY': {
      const items = state.items
        .map((i) => (i.menuItemId === action.payload.menuItemId ? { ...i, quantity: action.payload.quantity } : i))
        .filter((i) => i.quantity > 0)
      const next = { ...state, restaurantId: items.length ? state.restaurantId : null, restaurantName: items.length ? state.restaurantName : null, items }
      persist(next)
      return next
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter((i) => i.menuItemId !== action.payload.menuItemId)
      const next = { ...state, restaurantId: items.length ? state.restaurantId : null, restaurantName: items.length ? state.restaurantName : null, items }
      persist(next)
      return next
    }
    case 'CLEAR_CART': {
      const next = { restaurantId: null, restaurantName: null, items: [] }
      persist(next)
      return next
    }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialCart)

  const addItem = (menuItem, restaurantId, restaurantName) => {
    if (state.restaurantId && state.restaurantId !== restaurantId) {
      const confirmSwitch = window.confirm(
        `Keranjangmu masih berisi menu dari "${state.restaurantName}". Kosongkan dan mulai pesanan baru dari "${restaurantName}"?`
      )
      if (!confirmSwitch) return false
    }
    dispatch({ type: 'ADD_ITEM', payload: { menuItem, restaurantId, restaurantName } })
    return true
  }

  const updateQty = (menuItemId, quantity) => dispatch({ type: 'UPDATE_QTY', payload: { menuItemId, quantity } })
  const removeItem = (menuItemId) => dispatch({ type: 'REMOVE_ITEM', payload: { menuItemId } })
  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  const derived = useMemo(() => {
    const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const deliveryFee = state.items.length === 0 ? 0 : subtotal >= 75000 ? 0 : 8000
    const total = subtotal + deliveryFee
    return { itemCount, subtotal, deliveryFee, total }
  }, [state.items])

  const value = {
    restaurantId: state.restaurantId,
    restaurantName: state.restaurantName,
    items: state.items,
    ...derived,
    addItem,
    updateQty,
    removeItem,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart harus dipakai di dalam <CartProvider>')
  return ctx
}
