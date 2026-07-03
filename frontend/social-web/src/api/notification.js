import apiClient from './client'

export async function getNotifications(page = 0, size = 20) {
    const response = await apiClient.get('/notifications', {
        params: { page, size },
    })
    return response.data
}

export async function getUnreadCount() {
    const response = await apiClient.get('/notifications/unread-count')
    return response.data.count
}

export async function markAllAsRead() {
    await apiClient.post('/notifications/mark-read')
}