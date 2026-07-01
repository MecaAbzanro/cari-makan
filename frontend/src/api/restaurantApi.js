// src/api/restaurantApi.js
import apiClient from './client.js'

// params: { q, category, priceLevel, minRating, sort, lat, lng }
export async function fetchRestaurants(params = {}) {
  // Buang key yang nilainya kosong/undefined supaya query string bersih.
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )
  const { data } = await apiClient.get('/restaurants', { params: cleanParams })
  return data.data
}

export async function fetchRestaurantById(id) {
  const { data } = await apiClient.get(`/restaurants/${id}`)
  return data.data // { restaurant, menuItems, reviews }
}

export async function fetchCategories() {
  const { data } = await apiClient.get('/restaurants/categories')
  return data.data
}

export async function createRestaurant(payload) {
  const { data } = await apiClient.post('/restaurants', payload)
  return data.data
}

export async function updateRestaurant(id, payload) {
  const { data } = await apiClient.put(`/restaurants/${id}`, payload)
  return data.data
}

export async function deleteRestaurant(id) {
  const { data } = await apiClient.delete(`/restaurants/${id}`)
  return data
}
