import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))

  function loginUser(newToken) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  function logoutUser() {
    localStorage.removeItem('token')
    setToken(null)
  }

  const value = {
    token,
    isAuthenticated: !!token,
    loginUser,
    logoutUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
