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
export async function createPost(imageFile, caption) {
  const formData = new FormData()
  formData.append('image', imageFile)
  if (caption) {
    formData.append('caption', caption)
  }
  const response = await apiClient.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
export async function getLikes(postId) {
  const response = await apiClient.get(`/posts/${postId}/like`)
  return response.data
}
