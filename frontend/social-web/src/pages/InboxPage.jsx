import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getConversations } from '../api/messages'
import UserSearch from '../components/UserSearch'
import CreateGroupModal from '../components/CreateGroupModal'

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
            <div className="bg-white border-b border-sage-200 px-4 py-3 flex items-center gap-3">
                <Link to="/" className="text-gray-500 hover:text-gray-700 shrink-0" aria-label="Back to feed">
                    ?
                </Link>
                <div className="flex-1">
                    <UserSearch mode="message" placeholder="Search to message..." />
                </div>
                <button
                    onClick={() => setShowCreateGroup(true)}
                    className="text-sm font-medium text-mint-600 hover:text-mint-700 shrink-0"
                >
                    New Group
                </button>
            </div>

            <div className="max-w-md mx-auto flex flex-col gap-4 px-4 py-4">
                {loading && <p className="text-gray-500 text-center py-6">Loading...</p>}
                {error && <p className="text-red-500 text-center py-6">{error}</p>}
                {!loading && !error && conversations.length === 0 && (
                    <p className="text-gray-400 text-center py-10">
                        No conversations yet. Search for someone above to start one.
                    </p>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden divide-y divide-sage-100">
                    {conversations.map((c) => (
                        <Link
                            key={c.id}
                            to={`/messages/c/${c.id}`}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-sage-50"
                        >
                            <div className="w-11 h-11 rounded-full overflow-hidden bg-mint-100 text-mint-600 flex items-center justify-center font-semibold shrink-0">
                                {c.avatarUrl ? (
                                    <img src={c.avatarUrl} alt={c.displayName} className="w-full h-full object-cover" />
                                ) : (
                                    c.displayName.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm truncate ${c.unread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                    {c.displayName}
                                </p>
                                <p className={`text-xs truncate ${c.unread ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                                    {c.lastMessagePreview}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-xs text-gray-400">{timeAgo(c.lastMessageAt)}</span>
                                {c.unread && <span className="w-2 h-2 rounded-full bg-mint-600" />}
                            </div>
                        </Link>
                    ))}
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