import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { getConversations } from '../api/messages'
import UserSearch from '../components/UserSearch'
import CreateGroupModal from '../components/CreateGroupModal'
import SettingsMenu from '../components/SettingsMenu'

const navItems = [
    {
        to: '/',
        label: 'Feed',
        end: true,
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        to: '/reels',
        label: 'Reels',
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="18" rx="3" />
                <path d="M7 3v18M17 3v18M2 8h5M2 16h5M17 8h5M17 16h5" />
            </svg>
        ),
    },
    {
        to: '/messages',
        label: 'Messages',
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
    },
]

function GroupIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}

function timeAgo(dateString) {
    const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000)
    if (seconds < 60) return 'now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
}

function InboxPage() {
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showCreateGroup, setShowCreateGroup] = useState(false)

    async function loadConversations() {
        try {
            const data = await getConversations()
            setConversations(data)
        } catch (err) {
            setError('Failed to load messages')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setLoading(true)
        setError('')
        loadConversations()
        const interval = setInterval(loadConversations, 15000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-sage-50">
            <div className="bg-white/90 backdrop-blur-sm border-b border-border-light px-6 py-5 grid grid-cols-3 items-center">
                <div className="flex items-center gap-2 justify-self-start">
                    <Link to="/" className="font-display font-semibold text-2xl text-sunset-600 tracking-tight">
                        social-api
                    </Link>
                </div>
                <div className="justify-self-center w-full max-w-3xl">
                    <UserSearch mode="message" placeholder="Search to message..." />
                </div>
                <div className="justify-self-end">
                    <button
                        onClick={() => setShowCreateGroup(true)}
                        className="flex items-center gap-1.5 text-sm font-medium text-sunset-600 hover:text-sunset-700"
                    >
                        <GroupIcon />
                        New Group
                    </button>
                </div>
            </div>

            <div className="flex">
                <aside className="hidden md:flex flex-col w-64 shrink-0 gap-1 px-4 pt-6">
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-teal-100 text-teal-700'
                                            : 'text-ink-700 hover:bg-sage-100'
                                    }`
                                }
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        ))}

                        <SettingsMenu />
                    </nav>
                </aside>

                <div className="flex-1 flex justify-center px-6 py-6">
                    <div className="w-full max-w-3xl flex flex-col gap-4">
                        {loading && <p className="text-ink-500 text-center py-6">Loading...</p>}
                        {error && <p className="text-clay-500 text-center py-6">{error}</p>}
                        {!loading && !error && conversations.length === 0 && (
                            <p className="text-ink-400 text-center py-10">
                                No conversations yet. Search for someone above to start one.
                            </p>
                        )}

                        <div className="bg-white rounded-2xl shadow-sm border border-sage-100 overflow-hidden divide-y divide-sage-100">
                            {conversations.map((c) => (
                                <Link
                                    key={c.id}
                                    to={`/messages/c/${c.id}`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-sage-50"
                                >
                                    <div className="w-11 h-11 rounded-full overflow-hidden bg-sunset-50 text-sunset-600 flex items-center justify-center font-semibold shrink-0">
                                        {c.avatarUrl ? (
                                            <img src={c.avatarUrl} alt={c.displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            c.displayName.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm truncate ${c.unread ? 'font-semibold text-ink-900' : 'text-ink-700'}`}>
                                            {c.displayName}
                                        </p>
                                        <p className={`text-xs truncate ${c.unread ? 'text-ink-700 font-medium' : 'text-ink-400'}`}>
                                            {c.lastMessagePreview}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className="text-xs text-ink-400">{timeAgo(c.lastMessageAt)}</span>
                                        {c.unread && <span className="w-2 h-2 rounded-full bg-sunset-500" />}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {showCreateGroup && (
                <CreateGroupModal
                    onClose={() => setShowCreateGroup(false)}
                    onCreated={() => {
                        setShowCreateGroup(false)
                        loadConversations()
                    }}
                />
            )}
        </div>
    )
}

export default InboxPage