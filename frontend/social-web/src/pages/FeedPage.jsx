import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getFeed, getFollowingFeed } from '../api/posts'
import { getUnreadConversationCount } from '../api/messages'
import PostCard from '../components/PostCard'
import CreatePostModal from '../components/CreatePostModal'
import StoryTray from '../components/StoryTray'
import SettingsMenu from '../components/SettingsMenu'

const POLL_INTERVAL_MS = 15000

const navItems = [
  {
    to: '/',
    label: 'Feed',
    end: true,
    icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
  },
  {
    to: '/reels',
    label: 'Reels',
    icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="18" rx="3" />
          <path d="M7 3v18M17 3v18M2 8h5M2 16h5M17 8h5M17 16h5" />
        </svg>
    ),
  },
  {
    to: '/messages',
    label: 'Messages',
    icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    ),
  },
]

function FeedPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

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

  useEffect(() => {
    let cancelled = false
    async function poll() {
      try {
        const count = await getUnreadConversationCount()
        if (!cancelled) {
          setUnreadCount(count)
        }
      } catch (err) {
        console.error('Failed to fetch unread message count', err)
      }
    }
    poll()
    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  function handlePostCreated(newPost) {
    setPosts((prev) => [newPost, ...prev])
  }

  return (
      <div className="min-h-screen bg-sage-50 flex">
        <aside className="hidden md:flex flex-col w-64 shrink-0 gap-1 px-4 pt-6">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                            isActive
                                ? 'bg-teal-100 text-teal-700'
                                : 'text-ink-700 hover:bg-sage-100'
                        }`
                    }
                >
                  <span className="relative flex items-center justify-center">
                    {item.icon}
                    {item.to === '/messages' && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-clay-400 text-white text-[10px] font-semibold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                  </span>
                  {item.label}
                </NavLink>
            ))}

            <SettingsMenu />
          </nav>
        </aside>

        <div className="flex-1 flex justify-center px-6 py-6">
          <div className="w-full max-w-3xl flex flex-col gap-4">
            <StoryTray />

            <div className="flex items-center justify-between">
              <div className="flex gap-2 bg-sage-100 p-1 rounded-full">
                <button
                    onClick={() => setMode('all')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        mode === 'all'
                            ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white shadow-sm'
                            : 'text-ink-900 hover:text-pink-600'
                    }`}
                >
                  For You
                </button>
                <button
                    onClick={() => setMode('following')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        mode === 'following'
                            ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white shadow-sm'
                            : 'text-ink-900 hover:text-pink-600'
                    }`}
                >
                  Following
                </button>
              </div>
            </div>

            <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-3 bg-white border border-sage-200 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <span className="flex-1 text-ink-400 text-sm">
                What do you have in mind?
              </span>
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-teal-50 text-teal-600">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <circle cx="8.5" cy="10" r="1.5" />
                  <path d="M21 16l-5.5-5-6 6-2.5-2.5L3 18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            {loading && <p className="text-ink-500 text-center">Loading...</p>}
            {error && <p className="text-clay-500 text-center">{error}</p>}
            {!loading && !error && posts.length === 0 && (
                <div className="bg-white border border-sage-200 rounded-2xl px-5 py-4 text-center">
                  <p className="text-ink-500 text-sm">
                    Currently, there are no posts available. Would you like to create the first one?
                  </p>
                </div>
            )}

            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
          </div>
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
