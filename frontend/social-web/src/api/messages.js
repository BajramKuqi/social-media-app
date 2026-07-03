import apiClient from './client'

export async function getConversations() {
    const response = await apiClient.get('/conversations')
    return response.data
}

export async function getDirectConversation(userId) {
    try {
        const response = await apiClient.get(`/conversations/direct/${userId}`)
        return response.data
    } catch (err) {
        if (err.response && err.response.status === 404) return null
        throw err
    }
}

export async function sendDirectMessage(userId, content) {
    const response = await apiClient.post(`/conversations/direct/${userId}/messages`, { content })
    return response.data
}

export async function sendMessage(conversationId, content) {
    const response = await apiClient.post(`/conversations/${conversationId}/messages`, { content })
    return response.data
}

export async function getMessages(conversationId, page = 0, size = 30) {
    const response = await apiClient.get(`/conversations/${conversationId}/messages`, {
        params: { page, size },
    })
    return response.data
}

export async function pollMessages(conversationId, afterId) {
    const response = await apiClient.get(`/conversations/${conversationId}/messages/poll`, {
        params: { afterId },
    })
    return response.data
}

export async function markConversationAsRead(conversationId) {
    await apiClient.post(`/conversations/${conversationId}/read`)
}

export async function createGroup(name, memberUserIds) {
    const response = await apiClient.post('/conversations/group', { name, memberUserIds })
    return response.data
}
export async function getUnreadConversationCount() {
    const response = await apiClient.get('/conversations/unread-count')
    return response.data.count
}
export async function deleteMessage(messageId) {
    await apiClient.delete(`/conversations/messages/${messageId}`)
}

export async function deleteConversation(conversationId) {
    await apiClient.delete(`/conversations/${conversationId}`)
}
export async function exitGroup(conversationId) {
    const response = await apiClient.post(`/conversations/${conversationId}/exit`)
    return response.data
}
export async function addGroupMember(conversationId, userId) {
    await apiClient.post(`/conversations/${conversationId}/members`, { userId })
}