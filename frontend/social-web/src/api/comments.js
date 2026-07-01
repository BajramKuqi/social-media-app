import apiClient from './client'

export async function getComments(postId, page = 0, size = 10) {
    const response = await apiClient.get(`/posts/${postId}/comments`, {
        params: { page, size },
    })
    return response.data
}

export async function createComment(postId, content) {
    const response = await apiClient.post(`/posts/${postId}/comments`, { content })
    return response.data
}

export async function deleteComment(commentId) {
    await apiClient.delete(`/comments/${commentId}`)
}