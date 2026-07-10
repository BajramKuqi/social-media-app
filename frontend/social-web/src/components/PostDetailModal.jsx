import { useEffect, useState } from 'react'
import { getLikes, likePost, unlikePost, deletePost } from '../api/posts'
import { getComments, createComment, deleteComment } from '../api/comments'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function HeartIcon({ filled }) {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
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

function CloseIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    )
}

function PostDetailModal({ post, onClose, onPostDeleted }) {
    const { username } = useAuth()
    const isOwnPost = post.authorUsername === username

    const [liked, setLiked] = useState(post.likedByCurrentUser)
    const [likeCount, setLikeCount] = useState(post.likeCount)
    const [likeBusy, setLikeBusy] = useState(false)

    const [tab, setTab] = useState('comments')

    const [comments, setComments] = useState([])
    const [commentsLoading, setCommentsLoading] = useState(true)
    const [newComment, setNewComment] = useState('')
    const [posting, setPosting] = useState(false)

    const [likers, setLikers] = useState([])
    const [likersLoading, setLikersLoading] = useState(false)
    const [likersLoaded, setLikersLoaded] = useState(false)

    const [showMenu, setShowMenu] = useState(false)
    const [deletingPost, setDeletingPost] = useState(false)

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

    async function handleDeletePost() {
        if (deletingPost) return
        const confirmed = window.confirm('Delete this post? This cannot be undone.')
        if (!confirmed) return
        setDeletingPost(true)
        try {
            await deletePost(post.id)
            onPostDeleted && onPostDeleted(post.id)
            onClose()
        } catch (err) {
            console.error('Failed to delete post', err)
            alert('Failed to delete post. Please try again.')
        } finally {
            setDeletingPost(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-ink-800/60 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl h-[80vh] flex overflow-hidden border border-sage-100">
                {}
                <div className="w-1/2 bg-black flex items-center justify-center shrink-0">
                    <img
                        src={post.imageUrl}
                        alt={post.caption || 'Post'}
                        className="max-w-full max-h-full object-contain"
                    />
                </div>

                {}
                <div className="w-1/2 flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-sage-100">
                        <span className="font-medium text-ink-800">{post.authorUsername}</span>
                        <div className="flex items-center gap-3">
                            {isOwnPost && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu((prev) => !prev)}
                                        className="text-ink-500 hover:text-sunset-600 text-xl leading-none px-1"
                                        aria-label="Post options"
                                    >
                                        &#8942;
                                    </button>
                                    {showMenu && (
                                        <div className="absolute top-7 right-0 bg-white rounded-2xl shadow-lg overflow-hidden w-36 text-left z-10 border border-sage-100">
                                            <button
                                                onClick={handleDeletePost}
                                                disabled={deletingPost}
                                                className="w-full text-left px-4 py-2.5 text-sm text-clay-500 hover:bg-sage-50 disabled:opacity-50"
                                            >
                                                {deletingPost ? 'Deleting...' : 'Delete Post'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button
                                onClick={onClose}
                                className="text-ink-500 hover:text-sunset-600 transition-colors"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    </div>

                    {post.caption && (
                        <p className="px-4 py-2 text-sm text-ink-800 border-b border-sage-100">
                            <Link to={`/profile/${post.authorUsername}`} className="font-medium hover:text-sunset-600">
                                {post.authorUsername}
                            </Link> {post.caption}
                        </p>
                    )}

                    <div className="flex border-b border-sage-100">
                        <button
                            onClick={() => switchTab('comments')}
                            className={`flex-1 py-2 text-sm font-medium transition-colors ${
                                tab === 'comments' ? 'text-sunset-600 border-b-2 border-sunset-500' : 'text-ink-500/60 hover:text-sunset-600'
                            }`}
                        >
                            Comments
                        </button>
                        <button
                            onClick={() => switchTab('likes')}
                            className={`flex-1 py-2 text-sm font-medium transition-colors ${
                                tab === 'likes' ? 'text-sunset-600 border-b-2 border-sunset-500' : 'text-ink-500/60 hover:text-sunset-600'
                            }`}
                        >
                            Likes · {likeCount}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-3">
                        {tab === 'comments' && (
                            <>
                                {commentsLoading && <p className="text-ink-500/60 text-sm">Loading...</p>}
                                {!commentsLoading && comments.length === 0 && (
                                    <p className="text-ink-500/60 text-sm">No comments yet.</p>
                                )}
                                {!commentsLoading && comments.map((comment) => {
                                    const canDelete = comment.authorUsername === username || isOwnPost
                                    return (
                                        <div key={comment.id} className="flex justify-between items-start text-sm mb-2">
                                            <p className="text-ink-800">
                                                <Link to={`/profile/${comment.authorUsername}`} className="font-medium hover:text-sunset-600">
                                                    {comment.authorUsername}
                                                </Link>{' '}
                                                {comment.content}
                                            </p>
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-ink-500/40 hover:text-clay-500 ml-2 shrink-0"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </>
                        )}

                        {tab === 'likes' && (
                            <>
                                {likersLoading && <p className="text-ink-500/60 text-sm">Loading...</p>}
                                {!likersLoading && likers.length === 0 && (
                                    <p className="text-ink-500/60 text-sm">No likes yet.</p>
                                )}
                                {!likersLoading && likers.map((liker, i) => (
                                    <Link
                                        key={i}
                                        to={`/profile/${liker.username}`}
                                        className="block text-sm text-ink-800 mb-2 font-medium hover:text-sunset-600"
                                    >
                                        {liker.username}
                                    </Link>
                                ))}
                            </>
                        )}
                    </div>

                    <div className="border-t border-sage-100 px-4 py-3 flex flex-col gap-2">
                        <button
                            onClick={handleLikeToggle}
                            disabled={likeBusy}
                            className={`flex items-center gap-1.5 text-sm font-medium w-fit rounded-full px-2 py-1 -ml-2 transition-all disabled:opacity-50 ${
                                liked ? 'text-sunset-600' : 'text-ink-500 hover:text-sunset-600'
                            }`}
                        >
                            <HeartIcon filled={liked} />
                            {likeCount}
                        </button>

                        {tab === 'comments' && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                    placeholder="Add a comment..."
                                    className="flex-1 min-w-0 border border-sage-200 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sunset-500/30"
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={posting || !newComment.trim()}
                                    className="text-sunset-600 text-sm font-medium disabled:opacity-40 shrink-0 whitespace-nowrap"
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