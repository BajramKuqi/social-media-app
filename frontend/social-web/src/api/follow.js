import apiClient from './client'

export async function followUser(userId) {
    await apiClient.post(`/users/${userId}/follow`)
}

export async function unfollowUser(userId) {
    await apiClient.delete(`/users/${userId}/follow`)
}

export async function removeFollower(userId) {
    await apiClient.delete(`/users/${userId}/remove-follower`)
}

export async function getFollowers(userId, page = 0, size = 20) {
    const response = await apiClient.get(`/users/${userId}/followers`, {
        params: { page, size },
    })
    return response.data
}

export async function getFollowing(userId, page = 0, size = 20) {
    const response = await apiClient.get(`/users/${userId}/following`, {
        params: { page, size },
    })
    return response.data
}