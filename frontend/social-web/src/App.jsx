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

function ReelsIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="18" rx="3" />
            <path d="M7 3v18M17 3v18M2 8h5M2 16h5M17 8h5M17 16h5" />
        </svg>
    )
}

function ProfileIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
        </svg>
    )
}

function Navbar() {
    const { isAuthenticated, username } = useAuth()
    return (
        <nav className="bg-white/90 backdrop-blur-sm border-b border-sage-100 px-5 py-3 grid grid-cols-3 items-center sticky top-0 z-40">
            <div className="flex items-center gap-2 justify-self-start">
                <Link to="/" className="font-display font-semibold text-lg text-mint-600 tracking-tight mr-3">
                    social-api
                </Link>
                {isAuthenticated && (
                    <Link
                        to="/reels"
                        className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-mint-600 transition-colors px-3 py-1.5 rounded-full hover:bg-mint-100"
                    >
                        <ReelsIcon />
                        Reels
                    </Link>
                )}
            </div>
            {isAuthenticated && (
                <div className="justify-self-center w-full">
                    <UserSearch />
                </div>
            )}
            {isAuthenticated && (
                <div className="flex items-center gap-3 justify-self-end">
                    <MessageIcon />
                    <NotificationBell />
                    <Link
                        to={`/profile/${username}`}
                        className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-mint-600 transition-colors px-3 py-1.5 rounded-full hover:bg-mint-100"
                    >
                        <ProfileIcon />
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