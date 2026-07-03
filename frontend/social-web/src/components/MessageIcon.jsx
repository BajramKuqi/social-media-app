import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUnreadConversationCount } from '../api/messages'

const POLL_INTERVAL_MS = 15000

function MessageIcon() {
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        async function poll() {
            try {
                const count = await getUnreadConversationCount()
                setUnreadCount(count)
            } catch (err) {
                console.error('Failed to fetch unread message count', err)
            }
        }
        poll()
        const interval = setInterval(poll, POLL_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [])

    return (
        <Link to="/messages" className="relative p-2 rounded-full hover:bg-gray-100" aria-label="Messages">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.222 0-2.386-.22-3.445-.618L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-purple-600 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Link>
    )
}

export default MessageIcon