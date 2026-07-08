import { useState } from 'react'
import { likePost, unlikePost } from '../api/posts'
import { getComments, createComment, deleteComment } from '../api/comments'
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

function PostCard({ post }) {
  const [liked, setLiked] = useState(post.likedByCurrentUser)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [busy, setBusy] = useState(false)

  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const { username } = useAuth()
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [commentCount, setCommentCount] = useState(post.commentCount)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)

  async function handleLikeToggle() {
    if (busy) return
    setBusy(true)
    try {
      if (liked) {
        await unlikePost(post.id)
        setLiked(false)
        setLikeCount((prev) => prev - 1)
      } else {
        await likePost(post.id)
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
        const data = await getComments(post.id)
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
      const saved = await createComment(post.id, trimmed)
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
      await deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      setCommentCount((prev) => prev - 1)
    } catch (err) {
      console.error('Failed to delete comment', err)
    }
  }

  return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-mint-100">
        <div className="px-4 py-3 border-b border-mint-100">
          <Link to={`/profile/${post.authorUsername}`} className="font-medium text-ink-800 hover:text-mint-600">
            {post.authorUsername}
          </Link>
        </div>
        <img
            src={post.imageUrl}
            alt={post.caption || 'Post image'}
            className="w-full object-cover max-h-[500px]"
        />
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

          {post.caption && (
              <p className="text-ink-800 text-sm">
                <Link to={`/profile/${post.authorUsername}`} className="font-medium hover:text-mint-600">
                  {post.authorUsername}
                </Link>{' '}
                {post.caption}
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
                      className="flex-1 border border-sage-100 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500/30"
                  />
                  <button
                      onClick={handleAddComment}
                      disabled={posting || !newComment.trim()}
                      className="text-mint-600 text-sm font-medium disabled:opacity-40 px-2"
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

export default PostCard
