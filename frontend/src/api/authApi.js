// src/api/authApi.js
import apiClient from './client.js'

export async function registerUser({ name, email, password }) {
  const { data } = await apiClient.post('/auth/register', { name, email, password })
  return data.data
}

export async function loginUser({ email, password }) {
  const { data } = await apiClient.post('/auth/login', { email, password })
  return data.data
}

export async function getCurrentUser() {
  const { data } = await apiClient.get('/auth/me')
  return data.data
}
