import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import FeedPage from './pages/FeedPage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import UserSearch from './components/UserSearch'

function Navbar() {
    const { isAuthenticated, logoutUser, username } = useAuth()
    return (
        <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <Link to="/" className="font-semibold text-purple-600">social-api</Link>
            {isAuthenticated && (
                <div className="flex items-center gap-4">
                    <UserSearch />
                    <Link to={`/profile/${username}`} className="text-sm text-gray-600 hover:text-purple-600">
                        {username}
                    </Link>
                    <button
                        onClick={logoutUser}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Log out
                    </button>
                </div>
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
                <Route
                    path="/profile/:username"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
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
