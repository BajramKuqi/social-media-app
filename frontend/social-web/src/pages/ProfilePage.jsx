import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { followUser, unfollowUser } from '../api/follow'
import { useAuth } from '../context/AuthContext'
import { getUserProfile, getUserPosts, updateAvatar, removeAvatar } from '../api/users'
import PostDetailModal from '../components/PostDetailModal'
import { getHighlightsForUser, getHighlightDetail } from '../api/highlights'
import HighlightViewer from '../components/HighlightViewer'
import FollowListModal from '../components/FollowListModal'


function ProfilePage() {
    const { username } = useParams()
    const { username: currentUsername } = useAuth()

    const [profile, setProfile] = useState(null)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [followBusy, setFollowBusy] = useState(false)
    const [avatarUploading, setAvatarUploading] = useState(false)
    const [selectedPost, setSelectedPost] = useState(null)
    const fileInputRef = useRef(null)
    const [highlights, setHighlights] = useState([])
    const [activeHighlight, setActiveHighlight] = useState(null)
    const [highlightLoading, setHighlightLoading] = useState(false)
    const [followListMode, setFollowListMode] = useState(null)
    const [showAvatarMenu, setShowAvatarMenu] = useState(false)

    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            setError('')
            try {
                const [profileData, postsData, highlightsData] = await Promise.all([
                    getUserProfile(username),
                    getUserPosts(username),
                    getHighlightsForUser(username),
                ])
                if (!cancelled) {
                    setProfile(profileData)
                    setPosts(postsData.content)
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
        return <p className="text-gray-500 text-center py-10">Loading...</p>
    }

    if (error || !profile) {
        return <p className="text-red-500 text-center py-10">{error || 'Profile not found'}</p>
    }

    const isOwnProfile = username === currentUsername

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6">
            <div className="max-w-md mx-auto flex flex-col gap-6">
                <Link to="/" className="text-sm text-purple-600 hover:underline w-fit">
                    ? Back to feed
                </Link>
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <div
                            className={`relative w-20 h-20 rounded-full overflow-hidden bg-purple-100 text-purple-600 flex items-center justify-center text-2xl font-semibold ${
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
                                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center text-white text-xs opacity-0 hover:opacity-100">
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
                                <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-lg overflow-hidden w-40 text-left z-20">
                                    <button
                                        onClick={() => {
                                            setShowAvatarMenu(false)
                                            fileInputRef.current.click()
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100"
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
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
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
                            <h1 className="font-semibold text-lg text-gray-800">{profile.username}</h1>
                        </div>
                        <div className="flex gap-4 mt-1 text-sm text-gray-600">
                            <span><strong>{profile.postCount}</strong> posts</span>
                            <button onClick={() => setFollowListMode('followers')} className="hover:underline">
                                <strong>{profile.followerCount}</strong> followers
                            </button>
                            <button onClick={() => setFollowListMode('following')} className="hover:underline">
                                <strong>{profile.followingCount}</strong> following
                            </button>
                        </div>
                        {!isOwnProfile && (
                            <button
                                onClick={handleFollowToggle}
                                disabled={followBusy}
                                className={`mt-2 px-4 py-1.5 rounded text-sm font-medium disabled:opacity-50 ${
                                    profile.followedByCurrentUser
                                        ? 'bg-gray-100 text-gray-700 border border-gray-300'
                                        : 'bg-purple-600 text-white'
                                }`}
                            >
                                {profile.followedByCurrentUser ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>
                </div>

                {highlights.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto pb-1">
                        {highlights.map((h) => (
                            <button
                                key={h.id}
                                onClick={() => handleOpenHighlight(h.id)}
                                className="flex flex-col items-center gap-1 shrink-0 w-16"
                            >
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                                    {h.coverImageUrl && (
                                        <img
                                            src={h.coverImageUrl}
                                            alt={h.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <span className="text-xs text-gray-700 truncate w-full text-center">
                                    {h.title}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {posts.length === 0 ? (
                    <p className="text-gray-400 text-center py-10">No posts yet.</p>
                ) : (
                    <div className="grid grid-cols-3 gap-1">
                        {posts.map((post) => (
                            <button
                                key={post.id}
                                onClick={() => setSelectedPost(post)}
                                className="aspect-square bg-gray-200 overflow-hidden"
                            >
                                <img
                                    src={post.imageUrl}
                                    alt={post.caption || 'Post'}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}

                {selectedPost && (
                    <PostDetailModal
                        post={selectedPost}
                        onClose={() => setSelectedPost(null)}
                        onPostDeleted={(postId) => {
                            setPosts((prev) => prev.filter((p) => p.id !== postId))
                            setProfile((prev) => prev && ({ ...prev, postCount: prev.postCount - 1 }))
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
    )
}

export default ProfilePage