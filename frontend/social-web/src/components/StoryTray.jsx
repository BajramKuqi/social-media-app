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
      <div className="flex gap-4 overflow-x-auto pb-2 px-1">
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
          >
            {uploading ? '...' : '+'}
          </button>
          <span className="text-xs text-gray-500">Your story</span>
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
                className="flex flex-col items-center gap-1 flex-shrink-0"
            >
              <div
                  className={`w-16 h-16 rounded-full p-0.5 ${
                      group.hasUnseenStories
                          ? 'bg-gradient-to-tr from-purple-500 to-pink-500'
                          : 'bg-gray-300'
                  }`}
              >
                <img
                    src={group.authorAvatarUrl || '/default-avatar.png'}
                    alt={group.authorUsername}
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                />
              </div>
              <span className="text-xs text-gray-600 truncate w-16 text-center">
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
