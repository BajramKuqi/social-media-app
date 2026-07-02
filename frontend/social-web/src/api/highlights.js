import apiClient from './client'

export async function getHighlights() {
    const response = await apiClient.get('/highlights')
    return response.data
}

export async function createHighlight(title, storyId) {
    const response = await apiClient.post('/highlights', { title, storyId })
    return response.data
}

export async function addStoryToHighlight(highlightId, storyId) {
    const response = await apiClient.post(`/highlights/${highlightId}/stories`, { storyId })
    return response.data
}

export async function getHighlightDetail(highlightId) {
    const response = await apiClient.get(`/highlights/${highlightId}`)
    return response.data
}

export async function deleteHighlight(highlightId) {
    await apiClient.delete(`/highlights/${highlightId}`)
}
export async function getHighlightsForUser(username) {
    const response = await apiClient.get(`/users/${username}/highlights`)
    return response.data
}
export async function deleteHighlightItem(highlightId, itemId) {
    await apiClient.delete(`/highlights/${highlightId}/stories/${itemId}`)
}