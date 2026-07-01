import { useState } from 'react'
import { likePost, unlikePost } from '../api/posts'
import { getComments, createComment, deleteComment } from '../api/comments'
import { useAuth } from '../context/AuthContext'

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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <span className="font-medium text-gray-800">{post.authorUsername}</span>
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

          {post.caption && (
              <p className="text-gray-700 text-sm">
                <span className="font-medium">{post.authorUsername}</span>{' '}
                {post.caption}
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
                        <span className="font-medium">{comment.authorUsername}</span>{' '}
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

export default PostCard
