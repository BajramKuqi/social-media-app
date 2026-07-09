import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useNavigate, NavLink } from 'react-router-dom'
import { followUser, unfollowUser } from '../api/follow'
import { useAuth } from '../context/AuthContext'
import { getUserProfile, getUserPosts, updateAvatar, removeAvatar } from '../api/users'
import { getUserReels } from '../api/reels'
import { getUnreadConversationCount } from '../api/messages'
import PostDetailModal from '../components/PostDetailModal'
import ReelDetailModal from '../components/ReelDetailModal'
import { getHighlightsForUser, getHighlightDetail } from '../api/highlights'
import HighlightViewer from '../components/HighlightViewer'
import FollowListModal from '../components/FollowListModal'
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

function PlayIcon() {
    return (
        <svg className="absolute top-1 right-1 w-4 h-4 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
        </svg>
    )
}

function PostsIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
    )
}

function ReelsIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="18" rx="3" />
            <path d="M7 3v18M17 3v18M2 8h5M2 16h5M17 8h5M17 16h5" />
        </svg>
    )
}

function ProfilePage() {
    const { username } = useParams()
    const { username: currentUsername } = useAuth()
    const navigate = useNavigate()

    const [profile, setProfile] = useState(null)
    const [posts, setPosts] = useState([])
    const [reels, setReels] = useState([])
    const [activeTab, setActiveTab] = useState('posts') // 'posts' | 'reels'
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [followBusy, setFollowBusy] = useState(false)
    const [avatarUploading, setAvatarUploading] = useState(false)
    const [selectedPost, setSelectedPost] = useState(null)
    const [selectedReel, setSelectedReel] = useState(null)
    const fileInputRef = useRef(null)
    const [highlights, setHighlights] = useState([])
    const [activeHighlight, setActiveHighlight] = useState(null)
    const [highlightLoading, setHighlightLoading] = useState(false)
    const [followListMode, setFollowListMode] = useState(null)
    const [showAvatarMenu, setShowAvatarMenu] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            setError('')
            try {
                const [profileData, postsData, reelsData, highlightsData] = await Promise.all([
                    getUserProfile(username),
                    getUserPosts(username),
                    getUserReels(username),
                    getHighlightsForUser(username),
                ])
                if (!cancelled) {
                    setProfile(profileData)
                    setPosts(postsData.content)
                    setReels(reelsData.content)
                    setHighlights(highlightsData)
                }
            } catch (err) {
                if (!cancelled) setError('Failed to load profile')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [username])

    useEffect(() => {
        const postId = searchParams.get('post')
        if (!postId || posts.length === 0) return
        const match = posts.find((p) => String(p.id) === postId)
        if (match) {
            setSelectedPost(match)
        }
    }, [searchParams, posts])

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

    async function handleFollowToggle() {
        if (!profile || followBusy) return
        setFollowBusy(true)
        try {
            if (profile.followedByCurrentUser) {
                await unfollowUser(profile.id)
                setProfile((prev) => ({
                    ...prev,
                    followedByCurrentUser: false,
                    followerCount: prev.followerCount - 1,
                }))
            } else {
                await followUser(profile.id)
                setProfile((prev) => ({
                    ...prev,
                    followedByCurrentUser: true,
                    followerCount: prev.followerCount + 1,
                }))
            }
        } catch (err) {
            console.error('Failed to toggle follow', err)
        } finally {
            setFollowBusy(false)
        }
    }

    function handleMessageClick() {
        if (!profile) return
        navigate(`/messages/u/${profile.id}`, { state: { username: profile.username } })
    }

    async function handleAvatarChange(e) {
        const file = e.target.files[0]
        if (!file) return
        setAvatarUploading(true)
        try {
            const updated = await updateAvatar(file)
            setProfile((prev) => ({ ...prev, avatarUrl: updated.avatarUrl }))
        } catch (err) {
            console.error('Failed to upload avatar', err)
        } finally {
            setAvatarUploading(false)
        }
    }
    async function handleRemoveAvatar() {
        if (avatarUploading) return
        setAvatarUploading(true)
        try {
            const updated = await removeAvatar()
            setProfile((prev) => ({ ...prev, avatarUrl: updated.avatarUrl }))
        } catch (err) {
            console.error('Failed to remove avatar', err)
        } finally {
            setAvatarUploading(false)
        }
    }
    async function handleOpenHighlight(highlightId) {
        if (highlightLoading) return
        setHighlightLoading(true)
        try {
            const detail = await getHighlightDetail(highlightId)
            setActiveHighlight(detail)
        } catch (err) {
            console.error('Failed to load highlight', err)
        } finally {
            setHighlightLoading(false)
        }
    }

    if (loading) {
        return <p className="text-ink-500 text-center py-10">Loading...</p>
    }

    if (error || !profile) {
        return <p className="text-clay-500 text-center py-10">{error || 'Profile not found'}</p>
    }

    const isOwnProfile = username === currentUsername

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
                                        ? 'bg-sunset-100 text-sunset-700'
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
                <div className="w-full max-w-2xl md:max-w-3xl flex flex-col gap-6">
                    <div className="flex items-center gap-4 md:gap-8">
                        <div className="relative shrink-0">
                            <div
                                className={`relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden bg-sage-100 text-sunset-600 flex items-center justify-center text-2xl md:text-3xl font-semibold font-display ${
                                    isOwnProfile ? 'cursor-pointer' : ''
                                }`}
                                onClick={() => isOwnProfile && setShowAvatarMenu((prev) => !prev)}
                            >
                                {profile.avatarUrl ? (
                                    <img
                                        src={profile.avatarUrl}
                                        alt={profile.username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    profile.username.charAt(0).toUpperCase()
                                )}
                                {isOwnProfile && (
                                    <div className="absolute inset-0 bg-ink-800/0 hover:bg-ink-800/30 transition-colors flex items-center justify-center text-white text-xs opacity-0 hover:opacity-100">
                                        {avatarUploading ? '...' : 'Edit'}
                                    </div>
                                )}
                            </div>
                            {isOwnProfile && showAvatarMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowAvatarMenu(false)}
                                    />
                                    <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-lg overflow-hidden w-40 text-left z-20 border border-border-light">
                                        <button
                                            onClick={() => {
                                                setShowAvatarMenu(false)
                                                fileInputRef.current.click()
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-ink-800 hover:bg-sage-50"
                                        >
                                            Change Photo
                                        </button>
                                        {profile.avatarUrl && (
                                            <button
                                                onClick={() => {
                                                    setShowAvatarMenu(false)
                                                    handleRemoveAvatar()
                                                }}
                                                disabled={avatarUploading}
                                                className="w-full text-left px-4 py-2.5 text-sm text-clay-500 hover:bg-sage-50 disabled:opacity-50"
                                            >
                                                {avatarUploading ? 'Removing...' : 'Remove Photo'}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        {isOwnProfile && (
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h1 className="font-display font-semibold text-lg md:text-xl text-ink-800">{profile.username}</h1>
                            </div>
                            <div className="flex gap-4 mt-1 text-sm text-ink-500">
                                <span><strong className="text-ink-800">{profile.postCount}</strong> posts</span>
                                <span><strong className="text-ink-800">{profile.reelCount}</strong> reels</span>
                                <button onClick={() => setFollowListMode('followers')} className="hover:text-sunset-600 transition-colors">
                                    <strong className="text-ink-800">{profile.followerCount}</strong> followers
                                </button>
                                <button onClick={() => setFollowListMode('following')} className="hover:text-sunset-600 transition-colors">
                                    <strong className="text-ink-800">{profile.followingCount}</strong> following
                                </button>
                            </div>
                            {!isOwnProfile && (
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={handleFollowToggle}
                                        disabled={followBusy}
                                        className={`px-5 py-1.5 rounded-full text-sm font-medium disabled:opacity-50 transition-all duration-200 ${
                                            profile.followedByCurrentUser
                                                ? 'bg-sage-100 text-ink-800 border border-sage-100 hover:bg-sage-50'
                                                : 'story-ring text-white hover:glow-story hover:scale-105'
                                        }`}
                                    >
                                        {profile.followedByCurrentUser ? 'Following' : 'Follow'}
                                    </button>
                                    <button
                                        onClick={handleMessageClick}
                                        className="px-5 py-1.5 rounded-full text-sm font-medium bg-sage-100 text-ink-800 border border-sage-100 hover:bg-sage-50 transition-colors"
                                    >
                                        Message
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {highlights.length > 0 && (
                        <div className="flex gap-4 overflow-x-auto overflow-y-visible pt-2 pl-1 pb-2 -ml-1">
                            {highlights.map((h) => (
                                <button
                                    key={h.id}
                                    onClick={() => handleOpenHighlight(h.id)}
                                    className="flex flex-col items-center gap-1 shrink-0 w-16 group"
                                >
                                    <div className="w-16 h-16 rounded-full p-0.5 story-ring transition-transform duration-200 group-hover:scale-105 group-hover:glow-story">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-sage-100 border-2 border-white">
                                            {h.coverImageUrl && (
                                                <img
                                                    src={h.coverImageUrl}
                                                    alt={h.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs text-ink-800 truncate w-full text-center">
                                        {h.title}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2 bg-sage-100 p-1 rounded-full">
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                activeTab === 'posts'
                                    ? 'story-ring text-white shadow-sm'
                                    : 'text-ink-900 hover:text-sunset-600'
                            }`}
                        >
                            <PostsIcon />
                            Posts
                        </button>
                        <button
                            onClick={() => setActiveTab('reels')}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                activeTab === 'reels'
                                    ? 'story-ring text-white shadow-sm'
                                    : 'text-ink-900 hover:text-sunset-600'
                            }`}
                        >
                            <ReelsIcon />
                            Reels
                        </button>
                    </div>

                    {activeTab === 'posts' && (
                        posts.length === 0 ? (
                            <p className="text-ink-500/60 text-center py-10">No posts yet.</p>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1">
                                {posts.map((post) => (
                                    <button
                                        key={post.id}
                                        onClick={() => setSelectedPost(post)}
                                        className="aspect-square bg-sage-100 overflow-hidden rounded-md"
                                    >
                                        <img
                                            src={post.imageUrl}
                                            alt={post.caption || 'Post'}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )
                    )}

                    {activeTab === 'reels' && (
                        reels.length === 0 ? (
                            <p className="text-ink-500/60 text-center py-10">No reels yet.</p>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1">
                                {reels.map((reel) => (
                                    <button
                                        key={reel.id}
                                        onClick={() => setSelectedReel(reel)}
                                        className="aspect-square bg-ink-800 overflow-hidden relative rounded-md"
                                    >
                                        {reel.thumbnailUrl ? (
                                            <img
                                                src={reel.thumbnailUrl}
                                                alt={reel.caption || 'Reel'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <video
                                                src={reel.videoUrl}
                                                className="w-full h-full object-cover"
                                                muted
                                            />
                                        )}
                                        <PlayIcon />
                                    </button>
                                ))}
                            </div>
                        )
                    )}

                    {selectedPost && (
                        <PostDetailModal
                            post={selectedPost}
                            onClose={() => {
                                setSelectedPost(null)
                                if (searchParams.get('post')) {
                                    searchParams.delete('post')
                                    setSearchParams(searchParams)
                                }
                            }}
                            onPostDeleted={(postId) => {
                                setPosts((prev) => prev.filter((p) => p.id !== postId))
                                setProfile((prev) => prev && ({ ...prev, postCount: prev.postCount - 1 }))
                            }}
                        />
                    )}
                    {selectedReel && (
                        <ReelDetailModal
                            reel={selectedReel}
                            onClose={() => setSelectedReel(null)}
                            onReelDeleted={(reelId) => {
                                setReels((prev) => prev.filter((r) => r.id !== reelId))
                                setProfile((prev) => prev && ({ ...prev, reelCount: prev.reelCount - 1 }))
                            }}
                        />
                    )}
                    {activeHighlight && (
                        <HighlightViewer
                            highlight={activeHighlight}
                            isOwner={isOwnProfile}
                            onClose={() => {
                                setActiveHighlight(null)
                                getHighlightsForUser(username).then(setHighlights).catch(() => {})
                            }}
                        />
                    )}
                    {followListMode && (
                        <FollowListModal
                            userId={profile.id}
                            mode={followListMode}
                            isOwnProfile={isOwnProfile}
                            onClose={() => setFollowListMode(null)}
                            onCountChange={(delta) => {
                                setProfile((prev) => {
                                    if (!prev) return prev
                                    if (followListMode === 'followers') {
                                        return { ...prev, followerCount: prev.followerCount + delta }
                                    }
                                    if (followListMode === 'following') {
                                        return { ...prev, followingCount: prev.followingCount + delta }
                                    }
                                    return prev
                                })
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProfilePage