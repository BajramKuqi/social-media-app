import { useEffect, useState } from 'react'
import { getFeed, getFollowingFeed } from '../api/posts'
import PostCard from '../components/PostCard'
import CreatePostModal from '../components/CreatePostModal'
import StoryTray from '../components/StoryTray'

function FeedPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadFeed() {
      setLoading(true)
      setError('')
      try {
        const data =
            mode === 'all'
                ? await getFeed(0, 10)
                : await getFollowingFeed(0, 10)
        if (!cancelled) {
          setPosts(data.content)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load feed')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    loadFeed()
    return () => {
      cancelled = true
    }
  }, [mode])

  function handlePostCreated(newPost) {
    // Only prepend if it matches current view (new posts are always "yours",
    // so they belong in both all/following views since you follow yourself...
    // adjust if your backend excludes self from following feed)
    setPosts((prev) => [newPost, ...prev])
  }

  return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="max-w-md mx-auto flex flex-col gap-4">
          <StoryTray />
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                  onClick={() => setMode('all')}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                      mode === 'all'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-600 border border-gray-300'
                  }`}
              >
                All posts
              </button>
              <button
                  onClick={() => setMode('following')}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                      mode === 'following'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-600 border border-gray-300'
                  }`}
              >
                Following
              </button>
            </div>
            <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-purple-700"
            >
              + New Post
            </button>
          </div>

          {loading && <p className="text-gray-500 text-center">Loading...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {!loading && !error && posts.length === 0 && (
              <p className="text-gray-500 text-center">No posts yet.</p>
          )}
          {posts.map((post) => (
              <PostCard key={post.id} post={post} />
          ))}
        </div>

        {showCreateModal && (
            <CreatePostModal
                onClose={() => setShowCreateModal(false)}
                onPostCreated={handlePostCreated}
            />
        )}
      </div>
  )
}

export default FeedPage
