import { createContext, useContext, useState } from 'react'

function decodeUsername(token) {
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub || null
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [username, setUsername] = useState(decodeUsername(localStorage.getItem('token')))

  function loginUser(newToken) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUsername(decodeUsername(newToken))
  }

  function logoutUser() {
    localStorage.removeItem('token')
    setToken(null)
    setUsername(null)
  }

  const value = {
    token,
    username,
    isAuthenticated: !!token,
    loginUser,
    logoutUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
