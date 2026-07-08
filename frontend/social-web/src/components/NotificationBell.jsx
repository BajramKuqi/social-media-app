import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getNotifications, getUnreadCount, markAllAsRead } from '../api/notification'
import { useAuth } from '../context/AuthContext'

const POLL_INTERVAL_MS = 15000

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

function notificationText(n) {
    const isReel = n.reelId != null
    switch (n.type) {
        case 'FOLLOW':
            return 'started following you'
        case 'LIKE':
            return isReel ? 'liked your reel' : 'liked your post'
        case 'COMMENT':
            return isReel ? 'commented on your reel' : 'commented on your post'
        default:
            return ''
    }
}

function notificationLink(n, currentUsername) {
    if (n.type === 'FOLLOW') return `/profile/${n.actorUsername}`
    if (n.reelId != null) return `/profile/${currentUsername}?tab=reels&reel=${n.reelId}`
    return `/profile/${currentUsername}?post=${n.postId}`
}

function NotificationBell() {
    const { username } = useAuth()
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(false)
    const containerRef = useRef(null)

    useEffect(() => {
        async function poll() {
            try {
                const count = await getUnreadCount()
                setUnreadCount(count)
            } catch (err) {
                console.error('Failed to fetch unread count', err)
            }
        }
        poll()
        const interval = setInterval(poll, POLL_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    async function handleToggle() {
        const opening = !isOpen
        setIsOpen(opening)

        if (opening) {
            setLoading(true)
            try {
                const data = await getNotifications(0, 20)
                setNotifications(data.content)
            } catch (err) {
                console.error('Failed to load notifications', err)
            } finally {
                setLoading(false)
            }

            if (unreadCount > 0) {
                try {
                    await markAllAsRead()
                    setUnreadCount(0)
                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                } catch (err) {
                    console.error('Failed to mark notifications as read', err)
                }
            }
        }
    }

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-full hover:bg-mint-100 transition-colors"
                aria-label="Notifications"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-ink-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-clay-400 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[70vh] bg-white rounded-2xl shadow-lg border border-mint-100 flex flex-col z-50">
                    <div className="px-4 py-3 border-b border-mint-100 font-display font-semibold text-ink-800">
                        Notifications
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {loading && (
                            <p className="text-ink-500/60 text-sm text-center py-6">Loading...</p>
                        )}
                        {!loading && notifications.length === 0 && (
                            <p className="text-ink-500/60 text-sm text-center py-6">
                                No notifications yet.
                            </p>
                        )}
                        {!loading &&
                            notifications.map((n) => (
                                <Link
                                    key={n.id}
                                    to={notificationLink(n, username)}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-2.5 hover:bg-sage-50 transition-colors ${
                                        !n.read ? 'bg-clay-400/10' : ''
                                    }`}
                                >
                                    <div className="w-9 h-9 rounded-full overflow-hidden bg-mint-100 text-mint-600 flex items-center justify-center font-semibold shrink-0 text-sm font-display">
                                        {n.actorAvatarUrl ? (
                                            <img
                                                src={n.actorAvatarUrl}
                                                alt={n.actorUsername}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            n.actorUsername.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <p className="text-sm text-ink-800 min-w-0">
                                        <span className="font-medium">{n.actorUsername}</span>{' '}
                                        <span className="text-ink-500">{notificationText(n)}</span>{' '}
                                        <span className="text-ink-500/60 text-xs">{timeAgo(n.createdAt)}</span>
                                    </p>
                                </Link>
                            ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationBell