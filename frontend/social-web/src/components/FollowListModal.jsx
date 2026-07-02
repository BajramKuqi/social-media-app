import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFollowers, getFollowing, followUser, unfollowUser, removeFollower } from '../api/follow'
import { useAuth } from '../context/AuthContext'

function FollowListModal({ userId, mode, isOwnProfile, onClose, onCountChange }) {
    const [users, setUsers] = useState([])
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [busyUserId, setBusyUserId] = useState(null)
    const { username: currentUsername } = useAuth()

    const title = mode === 'followers' ? 'Followers' : 'Following'
    const fetchPage = mode === 'followers' ? getFollowers : getFollowing
    const showRemove = isOwnProfile && mode === 'followers'

    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            setError('')
            try {
                const data = await fetchPage(userId, 0, 20)
                if (!cancelled) {
                    setUsers(data.content)
                    setHasMore(!data.last)
                    setPage(0)
                }
            } catch (err) {
                if (!cancelled) setError('Failed to load list')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [userId, mode])

    async function handleLoadMore() {
        const nextPage = page + 1
        try {
            const data = await fetchPage(userId, nextPage, 20)
            setUsers((prev) => [...prev, ...data.content])
            setHasMore(!data.last)
            setPage(nextPage)
        } catch (err) {
            console.error('Failed to load more', err)
        }
    }

    async function handleFollowToggle(targetUser) {
        if (busyUserId) return
        setBusyUserId(targetUser.id)
        try {
            if (targetUser.followedByCurrentUser) {
                await unfollowUser(targetUser.id)
            } else {
                await followUser(targetUser.id)
            }
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === targetUser.id
                        ? { ...u, followedByCurrentUser: !u.followedByCurrentUser }
                        : u
                )
            )
            if (isOwnProfile && mode === 'following') {
                onCountChange && onCountChange(targetUser.followedByCurrentUser ? -1 : 1)
            }
        } catch (err) {
            console.error('Failed to toggle follow', err)
        } finally {
            setBusyUserId(null)
        }
    }

    async function handleRemove(targetUser) {
        if (busyUserId) return
        setBusyUserId(targetUser.id)
        try {
            await removeFollower(targetUser.id)
            setUsers((prev) => prev.filter((u) => u.id !== targetUser.id))
            onCountChange && onCountChange(-1)
        } catch (err) {
            console.error('Failed to remove follower', err)
        } finally {
            setBusyUserId(null)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl w-full max-w-sm max-h-[70vh] flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-800">{title}</span>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                <div className="overflow-y-auto flex-1">
                    {loading && (
                        <p className="text-gray-400 text-sm text-center py-6">Loading...</p>
                    )}
                    {!loading && error && (
                        <p className="text-red-500 text-sm text-center py-6">{error}</p>
                    )}
                    {!loading && !error && users.length === 0 && (
                        <p className="text-gray-400 text-sm text-center py-6">
                            {mode === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
                        </p>
                    )}
                    {!loading &&
                        users.map((u) => {
                            const isSelf = u.username === currentUsername
                            const isBusy = busyUserId === u.id
                            return (
                                <div key={u.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                                    <Link
                                        to={`/profile/${u.username}`}
                                        onClick={onClose}
                                        className="flex items-center gap-3 flex-1 min-w-0"
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 text-purple-600 flex items-center justify-center font-semibold shrink-0">
                                            {u.avatarUrl ? (
                                                <img
                                                    src={u.avatarUrl}
                                                    alt={u.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                u.username.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-800 truncate">{u.username}</span>
                                    </Link>

                                    {showRemove ? (
                                        !isSelf && (
                                            <button
                                                onClick={() => handleRemove(u)}
                                                disabled={isBusy}
                                                className="px-3 py-1.5 rounded text-xs font-medium disabled:opacity-50 shrink-0 bg-gray-100 text-gray-700 border border-gray-300"
                                            >
                                                {isBusy ? '...' : 'Remove'}
                                            </button>
                                        )
                                    ) : (
                                        !isSelf && (
                                            <button
                                                onClick={() => handleFollowToggle(u)}
                                                disabled={isBusy}
                                                className={`px-3 py-1.5 rounded text-xs font-medium disabled:opacity-50 shrink-0 ${
                                                    u.followedByCurrentUser
                                                        ? 'bg-gray-100 text-gray-700 border border-gray-300'
                                                        : 'bg-purple-600 text-white'
                                                }`}
                                            >
                                                {isBusy ? '...' : u.followedByCurrentUser ? 'Following' : 'Follow'}
                                            </button>
                                        )
                                    )}
                                </div>
                            )
                        })}
                    {!loading && hasMore && (
                        <button
                            onClick={handleLoadMore}
                            className="w-full text-sm text-purple-600 font-medium py-3 hover:bg-gray-50"
                        >
                            Load more
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FollowListModal