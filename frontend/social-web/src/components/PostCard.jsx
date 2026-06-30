import { useState } from 'react'
import { likePost, unlikePost } from '../api/posts'

function PostCard({ post }) {
  const [liked, setLiked] = useState(post.likedByCurrentUser)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [busy, setBusy] = useState(false)

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
          <span className="text-sm text-gray-500">
            {post.commentCount} comments
          </span>
        </div>
        {post.caption && (
          <p className="text-gray-700 text-sm">
            <span className="font-medium">{post.authorUsername}</span>{' '}
            {post.caption}
          </p>
        )}
      </div>
    </div>
  )
}

export default PostCard
