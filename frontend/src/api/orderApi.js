// src/api/orderApi.js
import apiClient from './client.js'

export async function createOrder(payload) {
  const { data } = await apiClient.post('/orders', payload)
  return data.data
}

export async function fetchMyOrders() {
  const { data } = await apiClient.get('/orders/my')
  return data.data
}

export async function fetchOrderById(id) {
  const { data } = await apiClient.get(`/orders/${id}`)
  return data.data
}
