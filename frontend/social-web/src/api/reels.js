import apiClient from './client'

export async function getReelsFeed(page = 0, size = 10) {
    const response = await apiClient.get('/reels', {
        params: { page, size },
    })
    return response.data
}

export async function getUserReels(username, page = 0, size = 20) {
    const response = await apiClient.get(`/users/${username}/reels`, {
        params: { page, size },
    })
    return response.data
}

export async function createReel(videoFile, caption, thumbnailFile, durationSeconds) {
    const formData = new FormData()
    formData.append('video', videoFile)
    if (caption) {
        formData.append('caption', caption)
    }
    if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile)
    }
    if (durationSeconds) {
        formData.append('durationSeconds', durationSeconds)
    }
    const response = await apiClient.post('/reels', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
}

export async function deleteReel(reelId) {
    await apiClient.delete(`/reels/${reelId}`)
}

export async function likeReel(reelId) {
    await apiClient.post(`/reels/${reelId}/like`)
}

export async function unlikeReel(reelId) {
    await apiClient.delete(`/reels/${reelId}/like`)
}

export async function getReelLikes(reelId) {
    const response = await apiClient.get(`/reels/${reelId}/like`)
    return response.data
}

export async function getReelComments(reelId, page = 0, size = 10) {
    const response = await apiClient.get(`/reels/${reelId}/comments`, {
        params: { page, size },
    })
    return response.data
}

export async function createReelComment(reelId, content) {
    const response = await apiClient.post(`/reels/${reelId}/comments`, { content })
    return response.data
}

export async function deleteReelComment(reelId, commentId) {
    await apiClient.delete(`/reels/${reelId}/comments/${commentId}`)
}