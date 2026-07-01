// src/api/favoriteApi.js
import apiClient from './client.js'

export async function fetchFavorites() {
  const { data } = await apiClient.get('/favorites')
  return data.data
}

export async function addFavorite(restaurantId) {
  const { data } = await apiClient.post(`/favorites/${restaurantId}`)
  return data.data
}

export async function removeFavorite(restaurantId) {
  const { data } = await apiClient.delete(`/favorites/${restaurantId}`)
  return data.data
}
