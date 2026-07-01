import { useEffect, useState } from 'react'
import { getLikes, likePost, unlikePost } from '../api/posts'
import { getComments, createComment, deleteComment } from '../api/comments'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function PostDetailModal({ post, onClose }) {
    const { username } = useAuth()

    const [liked, setLiked] = useState(post.likedByCurrentUser)
    const [likeCount, setLikeCount] = useState(post.likeCount)
    const [likeBusy, setLikeBusy] = useState(false)

    const [tab, setTab] = useState('comments') // 'comments' | 'likes'

    const [comments, setComments] = useState([])
    const [commentsLoading, setCommentsLoading] = useState(true)
    const [newComment, setNewComment] = useState('')
    const [posting, setPosting] = useState(false)

    const [likers, setLikers] = useState([])
    const [likersLoading, setLikersLoading] = useState(false)
    const [likersLoaded, setLikersLoaded] = useState(false)

    useEffect(() => {
        let cancelled = false
        async function loadComments() {
            setCommentsLoading(true)
            try {
                const data = await getComments(post.id)
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
    }, [post.id])

    async function loadLikers() {
        if (likersLoaded) return
        setLikersLoading(true)
        try {
            const data = await getLikes(post.id)
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
                await unlikePost(post.id)
                setLiked(false)
                setLikeCount((prev) => prev - 1)
                setLikers((prev) => prev.filter((l) => l.username !== username))
            } else {
                await likePost(post.id)
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
            const saved = await createComment(post.id, trimmed)
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
            await deleteComment(commentId)
            setComments((prev) => prev.filter((c) => c.id !== commentId))
        } catch (err) {
            console.error('Failed to delete comment', err)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl h-[80vh] flex overflow-hidden">
                {/* Left: image */}
                <div className="w-1/2 bg-black flex items-center justify-center shrink-0">
                    <img
                        src={post.imageUrl}
                        alt={post.caption || 'Post'}
                        className="max-w-full max-h-full object-contain"
                    />
                </div>

                {/* Right: details */}
                <div className="w-1/2 flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-800">{post.authorUsername}</span>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                        >
                            ✕
                        </button>
                    </div>

                    {post.caption && (
                        <p className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                            <Link to={`/profile/${post.authorUsername}`} className="font-medium hover:text-purple-600">
                                {post.authorUsername}
                            </Link> {post.caption}
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
                                {!commentsLoading && comments.map((comment) => (
                                    <div key={comment.id} className="flex justify-between items-start text-sm mb-2">
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

export default PostDetailModal