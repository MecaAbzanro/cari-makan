// src/api/client.js
// Instance axios terpusat. Semua pemanggilan API di seluruh aplikasi pakai
// instance ini, bukan axios langsung, supaya baseURL dan token otomatis
// konsisten di satu tempat saja.
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

// Sebelum tiap request dikirim, tempelkan token JWT dari localStorage
// (kalau ada) ke header Authorization. Dengan begini, komponen/page tidak
// perlu mengurus header otorisasi secara manual setiap kali memanggil API.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('carimakan_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Kalau backend membalas 401 (token tidak valid/kedaluwarsa), bersihkan
// sesi lokal supaya UI tidak "nyangkut" menganggap user masih login.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('carimakan_token')
      localStorage.removeItem('carimakan_user')
    }
    return Promise.reject(error)
  }
)

export default apiClient
