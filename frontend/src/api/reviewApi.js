// src/api/reviewApi.js
import apiClient from './client.js'

export async function fetchReviews(restaurantId) {
  const { data } = await apiClient.get(`/restaurants/${restaurantId}/reviews`)
  return data.data
}

export async function createReview(restaurantId, { rating, comment }) {
  const { data } = await apiClient.post(`/restaurants/${restaurantId}/reviews`, { rating, comment })
  return data.data
}

export async function deleteReview(reviewId) {
  const { data } = await apiClient.delete(`/reviews/${reviewId}`)
  return data
}
