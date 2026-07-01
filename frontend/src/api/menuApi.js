// src/api/menuApi.js
import apiClient from './client.js'

export async function fetchMenuItems(restaurantId) {
  const { data } = await apiClient.get(`/restaurants/${restaurantId}/menu`)
  return data.data
}

export async function createMenuItem(restaurantId, payload) {
  const { data } = await apiClient.post(`/restaurants/${restaurantId}/menu`, payload)
  return data.data
}

export async function updateMenuItem(menuId, payload) {
  const { data } = await apiClient.put(`/menu/${menuId}`, payload)
  return data.data
}

export async function deleteMenuItem(menuId) {
  const { data } = await apiClient.delete(`/menu/${menuId}`)
  return data
}
