import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import FeedPage from './pages/FeedPage'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

function Navbar() {
  const { isAuthenticated, logoutUser } = useAuth()

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
      <span className="font-semibold text-purple-600">social-api</span>
      {isAuthenticated && (
        <button
          onClick={logoutUser}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Log out
        </button>
      )}
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
