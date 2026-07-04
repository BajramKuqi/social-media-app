import { useState, useRef } from 'react'
import { likeReel, unlikeReel, getReelComments, createReelComment, deleteReelComment } from '../api/reels'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

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
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
                <Link to={`/profile/${reel.authorUsername}`} className="font-medium text-gray-800 hover:text-purple-600">
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
                        <div className="bg-black/40 rounded-full p-4">
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
                        className={`flex items-center gap-1 text-sm font-medium ${
                            liked ? 'text-purple-600' : 'text-gray-500'
                        } hover:text-purple-600 disabled:opacity-50`}
                    >
                        {liked ? 'Liked' : 'Like'} · {likeCount}
                    </button>
                    <button
                        onClick={toggleComments}
                        className="text-sm text-gray-500 hover:text-purple-600"
                    >
                        {commentCount} comments
                    </button>
                </div>

                {reel.caption && (
                    <p className="text-gray-700 text-sm">
                        <Link to={`/profile/${reel.authorUsername}`} className="font-medium hover:text-purple-600">
                            {reel.authorUsername}
                        </Link>{' '}
                        {reel.caption}
                    </p>
                )}

                {showComments && (
                    <div className="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-2">
                        {comments.length === 0 && (
                            <p className="text-gray-400 text-sm">No comments yet.</p>
                        )}
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex justify-between items-start text-sm">
                                <p className="text-gray-700">
                                    <Link to={`/profile/${comment.authorUsername}`} className="font-medium hover:text-purple-600">
                                        {comment.authorUsername}
                                    </Link>{' '}
                                    {comment.content}
                                </p>
                                {comment.authorUsername === username && (
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="text-gray-300 hover:text-red-500 text-xs ml-2 shrink-0"
                                    >
                                        delete
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
                    </div>
                )}
            </div>
        </div>
    )
}

export default ReelCard