// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'

import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import RestaurantDetail from './pages/RestaurantDetail.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'
import Favorites from './pages/Favorites.jsx'
import Cart from './pages/Cart.jsx'
import Orders from './pages/Orders.jsx'
import OrderDetail from './pages/OrderDetail.jsx'

import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminRestaurants from './pages/admin/AdminRestaurants.jsx'
import RestaurantForm from './pages/admin/RestaurantForm.jsx'
import MenuManager from './pages/admin/MenuManager.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1">
              <Routes>
                {/* Publik — bisa diakses tanpa login, sesuai pola GoFood */}
                <Route path="/" element={<Home />} />
                <Route path="/cari" element={<Search />} />
                <Route path="/restoran/:id" element={<RestaurantDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Keranjang bisa dilihat tanpa login, tapi checkout di dalamnya
                    akan minta login (lihat handleCheckout di Cart.jsx) */}
                <Route path="/keranjang" element={<Cart />} />

                {/* Wajib login */}
                <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/favorit" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                <Route path="/pesanan" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/pesanan/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

                {/* Admin — wajib login + role admin */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="restoran" element={<AdminRestaurants />} />
                  <Route path="restoran/baru" element={<RestaurantForm />} />
                  <Route path="restoran/:id/edit" element={<RestaurantForm />} />
                  <Route path="restoran/:restaurantId/menu" element={<MenuManager />} />
                  <Route path="pesanan" element={<AdminOrders />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />
          </div>

          <ToastContainer position="top-center" autoClose={2500} hideProgressBar pauseOnHover />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="font-display text-3xl font-bold text-char">404</h1>
      <p className="mt-2 text-sm text-char-soft">Halaman yang kamu cari tidak ditemukan.</p>
    </div>
  )
}

