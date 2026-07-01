// src/api/adminApi.js
import apiClient from './client.js'

export async function fetchAdminStats() {
  const { data } = await apiClient.get('/admin/stats')
  return data.data
}

export async function fetchAllOrders() {
  const { data } = await apiClient.get('/admin/orders')
  return data.data
}

export async function updateOrderStatus(orderId, status) {
  const { data } = await apiClient.put(`/admin/orders/${orderId}/status`, { status })
  return data.data
}

export async function fetchAllUsers() {
  const { data } = await apiClient.get('/admin/users')
  return data.data
}

export async function updateUserRole(userId, role) {
  const { data } = await apiClient.put(`/admin/users/${userId}/role`, { role })
  return data.data
}
