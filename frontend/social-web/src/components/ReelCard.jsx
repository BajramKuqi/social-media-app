import { useState, useRef } from 'react'
import { likeReel, unlikeReel, getReelComments, createReelComment, deleteReelComment } from '../api/reels'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function HeartIcon({ filled }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
        </svg>
    )
}

function CommentIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
        </svg>
    )
}

function TrashIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
        </svg>
    )
}

function ReelCard({ reel }) {
    const [liked, setLiked] = useState(reel.likedByCurrentUser)
    const [likeCount, setLikeCount] = useState(reel.likeCount)
    const [busy, setBusy] = useState(false)

    const [showComments, setShowComments] = useState(false)
    const [comments, setComments] = useState([])
    const { username } = useAuth()
    const [commentsLoaded, setCommentsLoaded] = useState(false)
    const [commentCount, setCommentCount] = useState(reel.commentCount)
    const [newComment, setNewComment] = useState('')
    const [posting, setPosting] = useState(false)

    const videoRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)

    async function handleLikeToggle() {
        if (busy) return
        setBusy(true)
        try {
            if (liked) {
                await unlikeReel(reel.id)
                setLiked(false)
                setLikeCount((prev) => prev - 1)
            } else {
                await likeReel(reel.id)
                setLiked(true)
                setLikeCount((prev) => prev + 1)
            }
        } catch (err) {
            console.error('Failed to toggle like', err)
        } finally {
            setBusy(false)
        }
    }

    async function toggleComments() {
        const next = !showComments
        setShowComments(next)
        if (next && !commentsLoaded) {
            try {
                const data = await getReelComments(reel.id)
                setComments(data.content)
                setCommentsLoaded(true)
            } catch (err) {
                console.error('Failed to load comments', err)
            }
        }
    }

    async function handleAddComment() {
        const trimmed = newComment.trim()
        if (!trimmed || posting) return
        setPosting(true)
        try {
            const saved = await createReelComment(reel.id, trimmed)
            setComments((prev) => [saved, ...prev])
            setCommentCount((prev) => prev + 1)
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
            setCommentCount((prev) => prev - 1)
        } catch (err) {
            console.error('Failed to delete comment', err)
        }
    }

    function togglePlay() {
        const video = videoRef.current
        if (!video) return
        if (video.paused) {
            video.play()
            setIsPlaying(true)
        } else {
            video.pause()
            setIsPlaying(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-mint-100">
            <div className="px-4 py-3 border-b border-mint-100">
                <Link to={`/profile/${reel.authorUsername}`} className="font-medium text-ink-800 hover:text-mint-600">
                    {reel.authorUsername}
                </Link>
            </div>
            <div className="relative bg-black flex items-center justify-center" onClick={togglePlay}>
                <video
                    ref={videoRef}
                    src={reel.videoUrl}
                    poster={reel.thumbnailUrl || undefined}
                    className="w-full max-h-[600px] object-contain cursor-pointer"
                    loop
                    playsInline
                />
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-mint-600/40 rounded-full p-4">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
            <div className="px-4 py-3 flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLikeToggle}
                        disabled={busy}
                        className={`flex items-center gap-1.5 text-sm font-medium rounded-full px-2 py-1 -ml-2 transition-all disabled:opacity-50 ${
                            liked ? 'text-mint-600 glow-mint' : 'text-ink-500 hover:text-mint-600'
                        }`}
                    >
                        <HeartIcon filled={liked} />
                        {likeCount}
                    </button>
                    <button
                        onClick={toggleComments}
                        className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-mint-600"
                    >
                        <CommentIcon />
                        {commentCount}
                    </button>
                </div>

                {reel.caption && (
                    <p className="text-ink-800 text-sm">
                        <Link to={`/profile/${reel.authorUsername}`} className="font-medium hover:text-mint-600">
                            {reel.authorUsername}
                        </Link>{' '}
                        {reel.caption}
                    </p>
                )}

                {showComments && (
                    <div className="mt-2 flex flex-col gap-2 border-t border-mint-100 pt-2">
                        {comments.length === 0 && (
                            <p className="text-ink-500/60 text-sm">No comments yet.</p>
                        )}
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex justify-between items-start text-sm">
                                <p className="text-ink-800">
                                    <Link to={`/profile/${comment.authorUsername}`} className="font-medium hover:text-mint-600">
                                        {comment.authorUsername}
                                    </Link>{' '}
                                    {comment.content}
                                </p>
                                {comment.authorUsername === username && (
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="text-ink-500/40 hover:text-clay-500 ml-2 shrink-0"
                                    >
                                        <TrashIcon />
                                    </button>
                                )}
                            </div>
                        ))}

                        <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                placeholder="Add a comment..."
                                className="flex-1 min-w-0 border border-sage-100 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500/30"
                            />
                            <button
                                onClick={handleAddComment}
                                disabled={posting || !newComment.trim()}
                                className="text-mint-600 text-sm font-medium disabled:opacity-40 px-2 shrink-0"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReelCard