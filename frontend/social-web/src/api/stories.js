import apiClient from './client'

export async function getStoryFeed() {
  const response = await apiClient.get('/stories/feed')
  return response.data
}

export async function createStory(mediaFile, caption, mediaType = 'IMAGE') {
  const formData = new FormData()
  formData.append('file', mediaFile)
  formData.append('mediaType', mediaType)
  if (caption) {
    formData.append('caption', caption)
  }
  const response = await apiClient.post('/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function viewStory(storyId) {
  const response = await apiClient.post(`/stories/${storyId}/view`)
  return response.data
}

export async function getStoryViewers(storyId) {
  const response = await apiClient.get(`/stories/${storyId}/viewers`)
  return response.data
}

export async function deleteStory(storyId) {
  await apiClient.delete(`/stories/${storyId}`)
}
