import { useEffect, useRef, useState } from 'react'
import { getStoryFeed, createStory } from '../api/stories'
import StoryViewer from './StoryViewer'
import { useAuth } from '../context/AuthContext'

function StoryTray() {
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [viewerIndex, setViewerIndex] = useState(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef(null)
    const { username } = useAuth()

    async function loadStories() {
        try {
            const data = await getStoryFeed()
            setGroups(data)
        } catch (err) {
            // silently fail for now, tray just won't show
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStories()
    }, [])

    async function handleFileSelected(e) {
        const file = e.target.files[0]
        if (!file) return
        setUploading(true)
        try {
            const mediaType = file.type.startsWith('video') ? 'VIDEO' : 'IMAGE'
            await createStory(file, '', mediaType)
            await loadStories()
        } catch (err) {
            // could add error toast here
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    function handleStoryViewed(authorId, storyId) {
        setGroups((prev) =>
            prev.map((g) => {
                if (g.authorId !== authorId) return g
                const updatedStories = g.stories.map((s) =>
                    s.id === storyId ? { ...s, viewedByCurrentUser: true } : s
                )
                return {
                    ...g,
                    stories: updatedStories,
                    hasUnseenStories: updatedStories.some((s) => !s.viewedByCurrentUser),
                }
            })
        )
    }

    function handleStoryDeleted(authorId, storyId) {
        setGroups((prev) =>
            prev
                .map((g) => {
                    if (g.authorId !== authorId) return g
                    const updatedStories = g.stories.filter((s) => s.id !== storyId)
                    return {
                        ...g,
                        stories: updatedStories,
                        hasUnseenStories: updatedStories.some((s) => !s.viewedByCurrentUser),
                    }
                })
                .filter((g) => g.stories.length > 0)
        )
    }

    if (loading) return null

    return (
        <div className="flex gap-4 overflow-x-auto overflow-y-visible pt-2 pb-3 px-1">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-16 h-16 rounded-full border-2 border-dashed border-ink-500/30 flex items-center justify-center text-ink-500 transition-all duration-200 hover:border-sunset-500 hover:text-sunset-600 hover:scale-105 hover:glow-story"
                >
                    {uploading ? '...' : '+'}
                </button>
                <span className="text-xs text-ink-500">Your story</span>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileSelected}
                />
            </div>
            {groups.map((group, idx) => (
                <button
                    key={group.authorId}
                    onClick={() => setViewerIndex(idx)}
                    className="flex flex-col items-center gap-1 flex-shrink-0 group"
                >
                    <div
                        className={`w-16 h-16 rounded-full p-0.5 transition-all duration-200 group-hover:scale-105 ${
                            group.hasUnseenStories
                                ? 'story-ring group-hover:glow-story'
                                : 'bg-sage-100'
                        }`}
                    >
                        <img
                            src={group.authorAvatarUrl || '/default-avatar.png'}
                            alt={group.authorUsername}
                            className="w-full h-full rounded-full object-cover border-2 border-white"
                        />
                    </div>
                    <span className="text-xs text-ink-500 truncate w-16 text-center">
            {group.authorUsername === username ? 'You' : group.authorUsername}
          </span>
                </button>
            ))}
            {viewerIndex !== null && (
                <StoryViewer
                    groups={groups}
                    startIndex={viewerIndex}
                    onClose={() => setViewerIndex(null)}
                    onStoryViewed={handleStoryViewed}
                    onStoryDeleted={handleStoryDeleted}
                />
            )}
        </div>
    )
}

export default StoryTray