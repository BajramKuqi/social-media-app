import apiClient from './client'

export async function followUser(userId) {
    await apiClient.post(`/users/${userId}/follow`)
}

export async function unfollowUser(userId) {
    await apiClient.delete(`/users/${userId}/follow`)
}