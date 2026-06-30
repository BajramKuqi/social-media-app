import apiClient from './client'

export async function getFeed(page = 0, size = 10) {
  const response = await apiClient.get('/posts', {
    params: { page, size },
  })
  return response.data
}

export async function getFollowingFeed(page = 0, size = 10) {
  const response = await apiClient.get('/posts/following', {
    params: { page, size },
  })
  return response.data
}

export async function likePost(postId) {
  await apiClient.post(`/posts/${postId}/like`)
}

export async function unlikePost(postId) {
  await apiClient.delete(`/posts/${postId}/like`)
}
