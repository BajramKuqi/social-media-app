import apiClient from './client'

export async function register(username, email, password) {
  const response = await apiClient.post('/auth/register', {
    username,
    email,
    password,
  })
  return response.data
}

export async function login(username, password) {
  const response = await apiClient.post('/auth/login', {
    username,
    password,
  })
  // Backend returns the raw JWT as plain text, not JSON
  return response.data
}
