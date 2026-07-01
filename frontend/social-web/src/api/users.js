import apiClient from './client'

export async function getUserProfile(username) {
    const response = await apiClient.get(`/users/${username}/profile`)
    return response.data
}

export async function getUserPosts(username, page = 0, size = 20) {
    const response = await apiClient.get(`/users/${username}/posts`, {
        params: { page, size },
    })
    return response.data
}
export async function updateAvatar(imageFile) {
    const formData = new FormData()
    formData.append('image', imageFile)
    const response = await apiClient.put('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
}
export async function removeAvatar() {
    const response = await apiClient.delete('/users/me/avatar')
    return response.data
}
export async function searchUsers(query) {
    const response = await apiClient.get('/users/search', {
        params: { query },
    })
    return response.data
}