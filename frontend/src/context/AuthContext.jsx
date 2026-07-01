// src/context/AuthContext.jsx
// Mengelola status autentikasi secara global lewat useReducer + Context API.
// Token & data user disimpan juga di localStorage supaya sesi tidak hilang
// saat halaman di-refresh.
import { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { registerUser, loginUser, getCurrentUser } from '../api/authApi.js'

const AuthContext = createContext(null)

const TOKEN_KEY = 'carimakan_token'
const USER_KEY = 'carimakan_user'

const initialState = {
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isLoading: true, // true di awal, sampai kita selesai cek validitas token tersimpan
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null }
    case 'AUTH_SUCCESS':
      return { ...state, isLoading: false, user: action.payload.user, token: action.payload.token, error: null }
    case 'AUTH_FAIL':
      return { ...state, isLoading: false, user: null, token: null, error: action.payload }
    case 'LOGOUT':
      return { ...state, isLoading: false, user: null, token: null, error: null }
    case 'STOP_LOADING':
      return { ...state, isLoading: false }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Saat aplikasi pertama kali dimuat, kalau ada token tersimpan, validasi
  // ke backend (GET /auth/me). Kalau token sudah kedaluwarsa/tidak valid,
  // backend akan balas 401 dan kita anggap user logout.
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (!storedToken) {
      dispatch({ type: 'STOP_LOADING' })
      return
    }

    getCurrentUser()
      .then((user) => {
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token: storedToken } })
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        dispatch({ type: 'AUTH_FAIL', payload: null })
      })
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const data = await registerUser({ name, email, password })
      const { token, ...user } = data
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } })
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Registrasi gagal, coba lagi.'
      dispatch({ type: 'AUTH_FAIL', payload: message })
      return { success: false, message }
    }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const data = await loginUser({ email, password })
      const { token, ...user } = data
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } })
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Email atau password salah.'
      dispatch({ type: 'AUTH_FAIL', payload: message })
      return { success: false, message }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    dispatch({ type: 'LOGOUT' })
  }, [])

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: Boolean(state.user),
    isLoading: state.isLoading,
    error: state.error,
    register,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return ctx
}
