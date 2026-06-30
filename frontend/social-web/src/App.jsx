import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import { useAuth } from './context/AuthContext'

function HomePage() {
  const { isAuthenticated, logoutUser } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold text-gray-800">
        social-api frontend
      </h1>
      {isAuthenticated ? (
        <button
          onClick={logoutUser}
          className="bg-purple-600 text-white rounded px-4 py-2 font-medium hover:bg-purple-700"
        >
          Log out
        </button>
      ) : (
        <p className="text-gray-500">
          You are not logged in.
        </p>
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
