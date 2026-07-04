import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import FeedPage from './pages/FeedPage'
import ReelsPage from './pages/ReelsPage'
import ProfilePage from './pages/ProfilePage'
import InboxPage from './pages/InboxPage'
import ConversationPage from './pages/ConversationPage'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import UserSearch from './components/UserSearch'
import NotificationBell from './components/NotificationBell'
import MessageIcon from './components/MessageIcon'
import SettingsMenu from './components/SettingsMenu'

function Navbar() {
    const { isAuthenticated, username } = useAuth()
    return (
        <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Link to="/" className="font-semibold text-purple-600">social-api</Link>
                {isAuthenticated && (
                    <Link to="/reels" className="text-sm text-gray-600 hover:text-purple-600">
                        Reels
                    </Link>
                )}
            </div>
            {isAuthenticated && (
                <div className="flex items-center gap-4">
                    <UserSearch />
                    <MessageIcon />
                    <NotificationBell />
                    <Link to={`/profile/${username}`} className="text-sm text-gray-600 hover:text-purple-600">
                        {username}
                    </Link>
                    <SettingsMenu />
                </div>
            )}
        </nav>
    )
}

function AppContent() {
    const location = useLocation()
    const hideNavbar = location.pathname.startsWith('/messages')
    return (
        <>
            {!hideNavbar && <Navbar />}
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
                    path="/reels"
                    element={
                        <ProtectedRoute>
                            <ReelsPage />
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
                <Route
                    path="/messages"
                    element={
                        <ProtectedRoute>
                            <InboxPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/messages/c/:conversationId"
                    element={
                        <ProtectedRoute>
                            <ConversationPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/messages/u/:userId"
                    element={
                        <ProtectedRoute>
                            <ConversationPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </>
    )
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    )
}

export default App