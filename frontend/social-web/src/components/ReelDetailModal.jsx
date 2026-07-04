import { useEffect, useState } from 'react'
import { getReelLikes, likeReel, unlikeReel, deleteReel, getReelComments, createReelComment, deleteReelComment } from '../api/reels'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function ReelDetailModal({ reel, onClose, onReelDeleted }) {
    const { username } = useAuth()
    const isOwnReel = reel.authorUsername === username

    const [liked, setLiked] = useState(reel.likedByCurrentUser)
    const [likeCount, setLikeCount] = useState(reel.likeCount)
    const [likeBusy, setLikeBusy] = useState(false)

    const [tab, setTab] = useState('comments') // 'comments' | 'likes'

    const [comments, setComments] = useState([])
    const [commentsLoading, setCommentsLoading] = useState(true)
    const [newComment, setNewComment] = useState('')
    const [posting, setPosting] = useState(false)

    const [likers, setLikers] = useState([])
    const [likersLoading, setLikersLoading] = useState(false)
    const [likersLoaded, setLikersLoaded] = useState(false)

    const [showMenu, setShowMenu] = useState(false)
    const [deletingReel, setDeletingReel] = useState(false)

    useEffect(() => {
        let cancelled = false
        async function loadComments() {
            setCommentsLoading(true)
            try {
                const data = await getReelComments(reel.id)
                if (!cancelled) setComments(data.content)
            } catch (err) {
                console.error('Failed to load comments', err)
            } finally {
                if (!cancelled) setCommentsLoading(false)
            }
        }
        loadComments()
        return () => {
            cancelled = true
        }
    }, [reel.id])

    async function loadLikers() {
        if (likersLoaded) return
        setLikersLoading(true)
        try {
            const data = await getReelLikes(reel.id)
            setLikers(data)
            setLikersLoaded(true)
        } catch (err) {
            console.error('Failed to load likes', err)
        } finally {
            setLikersLoading(false)
        }
    }

    function switchTab(next) {
        setTab(next)
        if (next === 'likes') loadLikers()
    }

    async function handleLikeToggle() {
        if (likeBusy) return
        setLikeBusy(true)
        try {
            if (liked) {
                await unlikeReel(reel.id)
                setLiked(false)
                setLikeCount((prev) => prev - 1)
                setLikers((prev) => prev.filter((l) => l.username !== username))
            } else {
                await likeReel(reel.id)
                setLiked(true)
                setLikeCount((prev) => prev + 1)
                setLikers((prev) => [...prev, { username }])
            }
        } catch (err) {
            console.error('Failed to toggle like', err)
        } finally {
            setLikeBusy(false)
        }
    }

    async function handleAddComment() {
        const trimmed = newComment.trim()
        if (!trimmed || posting) return
        setPosting(true)
        try {
            const saved = await createReelComment(reel.id, trimmed)
            setComments((prev) => [saved, ...prev])
            setNewComment('')
        } catch (err) {
            console.error('Failed to post comment', err)
        } finally {
            setPosting(false)
        }
    }

    async function handleDeleteComment(commentId) {
        try {
            await deleteReelComment(reel.id, commentId)
            setComments((prev) => prev.filter((c) => c.id !== commentId))
        } catch (err) {
            console.error('Failed to delete comment', err)
        }
    }

    async function handleDeleteReel() {
        if (deletingReel) return
        const confirmed = window.confirm('Delete this reel? This cannot be undone.')
        if (!confirmed) return
        setDeletingReel(true)
        try {
            await deleteReel(reel.id)
            onReelDeleted && onReelDeleted(reel.id)
            onClose()
        } catch (err) {
            console.error('Failed to delete reel', err)
            alert('Failed to delete reel. Please try again.')
        } finally {
            setDeletingReel(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl h-[80vh] flex overflow-hidden">
                {/* Left: video */}
                <div className="w-1/2 bg-black flex items-center justify-center shrink-0">
                    <video
                        src={reel.videoUrl}
                        poster={reel.thumbnailUrl || undefined}
                        className="max-w-full max-h-full object-contain"
                        controls
                        autoPlay
                        loop
                    />
                </div>

                {/* Right: details */}
                <div className="w-1/2 flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-800">{reel.authorUsername}</span>
                        <div className="flex items-center gap-3">
                            {isOwnReel && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu((prev) => !prev)}
                                        className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1"
                                        aria-label="Reel options"
                                    >
                                        &#8942;
                                    </button>
                                    {showMenu && (
                                        <div className="absolute top-7 right-0 bg-white rounded-lg shadow-lg overflow-hidden w-36 text-left z-10">
                                            <button
                                                onClick={handleDeleteReel}
                                                disabled={deletingReel}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
                                            >
                                                {deletingReel ? 'Deleting...' : 'Delete Reel'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    {reel.caption && (
                        <p className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                            <Link to={`/profile/${reel.authorUsername}`} className="font-medium hover:text-purple-600">
                                {reel.authorUsername}
                            </Link> {reel.caption}
                        </p>
                    )}

                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => switchTab('comments')}
                            className={`flex-1 py-2 text-sm font-medium ${
                                tab === 'comments' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'
                            }`}
                        >
                            Comments
                        </button>
                        <button
                            onClick={() => switchTab('likes')}
                            className={`flex-1 py-2 text-sm font-medium ${
                                tab === 'likes' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'
                            }`}
                        >
                            Likes · {likeCount}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-3">
                        {tab === 'comments' && (
                            <>
                                {commentsLoading && <p className="text-gray-400 text-sm">Loading...</p>}
                                {!commentsLoading && comments.length === 0 && (
                                    <p className="text-gray-400 text-sm">No comments yet.</p>
                                )}
                                {!commentsLoading && comments.map((comment) => {
                                    const canDelete = comment.authorUsername === username || isOwnReel
                                    return (
                                        <div key={comment.id} className="flex justify-between items-start text-sm mb-2">
                                            <p className="text-gray-700">
                                                <Link to={`/profile/${comment.authorUsername}`} className="font-medium hover:text-purple-600">
                                                    {comment.authorUsername}
                                                </Link>{' '}
                                                {comment.content}
                                            </p>
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-gray-300 hover:text-red-500 text-xs ml-2 shrink-0"
                                                >
                                                    delete
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </>
                        )}

                        {tab === 'likes' && (
                            <>
                                {likersLoading && <p className="text-gray-400 text-sm">Loading...</p>}
                                {!likersLoading && likers.length === 0 && (
                                    <p className="text-gray-400 text-sm">No likes yet.</p>
                                )}
                                {!likersLoading && likers.map((liker, i) => (
                                    <Link
                                        key={i}
                                        to={`/profile/${liker.username}`}
                                        className="block text-sm text-gray-700 mb-2 font-medium hover:text-purple-600"
                                    >
                                        {liker.username}
                                    </Link>
                                ))}
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-100 px-4 py-3 flex flex-col gap-2">
                        <button
                            onClick={handleLikeToggle}
                            disabled={likeBusy}
                            className={`text-sm font-medium w-fit ${
                                liked ? 'text-purple-600' : 'text-gray-500'
                            } hover:text-purple-600 disabled:opacity-50`}
                        >
                            {liked ? 'Liked' : 'Like'} · {likeCount}
                        </button>

                        {tab === 'comments' && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                    placeholder="Add a comment..."
                                    className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={posting || !newComment.trim()}
                                    className="text-purple-600 text-sm font-medium disabled:opacity-40"
                                >
                                    Post
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReelDetailModal