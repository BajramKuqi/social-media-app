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

function ProfileIcon({ filled }) {
    if (filled) {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7Z" />
            </svg>
        )
    }
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
        </svg>
    )
}

function Navbar() {
    const { isAuthenticated, username } = useAuth()
    const location = useLocation()
    const isProfileActive = location.pathname.startsWith(`/profile/${username}`)

    return (
        <nav className="bg-white/90 backdrop-blur-sm border-b border-border-light px-6 h-20 grid grid-cols-3 items-center sticky top-0 z-40">
            <div className="flex items-center gap-2 justify-self-start">
                <Link to="/" className="flex items-center gap-2">
                    <svg width="28" height="28" viewBox="0 0 64 68" fill="none">
                        <defs>
                            <linearGradient id="oraGradientNav" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="var(--color-sunset-500)" />
                                <stop offset="100%" stopColor="var(--color-plum-500)" />
                            </linearGradient>
                        </defs>
                        <rect x="4" y="0" width="56" height="8" rx="4" fill="url(#oraGradientNav)" />
                        <rect x="4" y="60" width="56" height="8" rx="4" fill="url(#oraGradientNav)" />
                        <path
                            d="M10 8 C10 24 30 28 30 34 C30 40 10 44 10 60 L54 60 C54 44 34 40 34 34 C34 28 54 24 54 8 Z"
                            fill="none"
                            stroke="url(#oraGradientNav)"
                            strokeWidth="4"
                            strokeLinejoin="round"
                        />
                        <path d="M16 14 C18 24 28 27 30 32 C32 27 42 24 44 14 Z" fill="url(#oraGradientNav)" opacity="0.85" />
                        <path d="M17 54 C19 46 28 41 30 36 C32 41 41 46 43 54 Z" fill="url(#oraGradientNav)" opacity="0.55" />
                    </svg>
                    <span className="font-display font-semibold text-2xl text-sunset-600 tracking-tight">
                        Ora
                    </span>
                </Link>
            </div>
            {isAuthenticated && (
                <div className="justify-self-center w-full max-w-3xl">
                    <UserSearch />
                </div>
            )}
            {isAuthenticated && (
                <div className="flex items-center gap-4 justify-self-end">
                    <span className="scale-110">
                        <NotificationBell />
                    </span>
                    <Link
                        to={`/profile/${username}`}
                        className={`flex items-center gap-2 text-base font-medium transition-colors duration-150 ${
                            isProfileActive ? 'text-pink-600' : 'text-ink-500 hover:text-ink-900'
                        }`}
                    >
                        <ProfileIcon filled={isProfileActive} />
                        <span
                            className={
                                isProfileActive
                                    ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent'
                                    : ''
                            }
                        >
                            {username}
                        </span>
                    </Link>
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