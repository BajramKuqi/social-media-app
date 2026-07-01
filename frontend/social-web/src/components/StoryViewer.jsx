import { useEffect, useRef, useState } from 'react'
import { viewStory, getStoryViewers } from '../api/stories'
import { useAuth } from '../context/AuthContext'

const STORY_DURATION_MS = 5000

function StoryViewer({ groups, startIndex, onClose, onStoryViewed }) {
  const [groupIndex, setGroupIndex] = useState(startIndex)
  const [storyIndex, setStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showViewers, setShowViewers] = useState(false)
  const [viewers, setViewers] = useState([])
  const [viewersLoading, setViewersLoading] = useState(false)
  const intervalRef = useRef(null)
  const { username } = useAuth()

  const currentGroup = groups[groupIndex]
  const currentStory = currentGroup?.stories[storyIndex]
  const isOwnStory = currentGroup?.authorUsername === username

  useEffect(() => {
    if (!currentStory) return

    viewStory(currentStory.id)
      .then(() => {
        onStoryViewed(currentGroup.authorId, currentStory.id)
      })
      .catch(() => {})

    setShowViewers(false)
    setViewers([])

    setProgress(0)
    const startTime = Date.now()
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min((elapsed / STORY_DURATION_MS) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        goToNext()
      }
    }, 50)

    return () => clearInterval(intervalRef.current)
  }, [groupIndex, storyIndex])

  function goToNext() {
    clearInterval(intervalRef.current)
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex(storyIndex + 1)
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(groupIndex + 1)
      setStoryIndex(0)
    } else {
      onClose()
    }
  }

  function goToPrev() {
    clearInterval(intervalRef.current)
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1)
    } else if (groupIndex > 0) {
      setGroupIndex(groupIndex - 1)
      setStoryIndex(0)
    }
  }

  async function handleShowViewers() {
    clearInterval(intervalRef.current)
    setShowViewers(true)
    setViewersLoading(true)
    try {
      const data = await getStoryViewers(currentStory.id)
      setViewers(data)
    } catch (err) {
      setViewers([])
    } finally {
      setViewersLoading(false)
    }
  }

  function handleCloseViewers() {
    setShowViewers(false)
    setProgress(0)
    const startTime = Date.now()
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min((elapsed / STORY_DURATION_MS) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        goToNext()
      }
    }, 50)
  }

  if (!currentStory) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-2xl z-20"
      >
        ×
      </button>

      <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
        {currentGroup.stories.map((s, idx) => (
          <div key={s.id} className="flex-1 h-1 bg-white/30 rounded overflow-hidden">
            <div
              className="h-full bg-white transition-none"
              style={{
                width:
                  idx < storyIndex ? '100%' : idx === storyIndex ? `${progress}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      <div className="absolute top-8 left-2 flex items-center gap-2 z-10">
        <img
          src={currentGroup.authorAvatarUrl || '/default-avatar.png'}
          alt={currentGroup.authorUsername}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-white text-sm font-medium">
          {currentGroup.authorUsername}
        </span>
      </div>

      <div className="relative w-full max-w-md h-full flex items-center">
        {!showViewers && (
          <>
            <button
              className="absolute left-0 top-0 h-full w-1/3 z-10"
              onClick={goToPrev}
            />
            <button
              className="absolute right-0 top-0 h-full w-1/3 z-10"
              onClick={goToNext}
            />
          </>
        )}
        {currentStory.mediaType === 'VIDEO' ? (
          <video
            src={currentStory.mediaUrl}
            className="w-full h-full object-contain"
            autoPlay
            muted
          />
        ) : (
          <img
            src={currentStory.mediaUrl}
            alt={currentStory.caption || 'story'}
            className="w-full h-full object-contain"
          />
        )}
        {currentStory.caption && !showViewers && (
          <div className="absolute bottom-16 left-0 right-0 text-center text-white text-sm px-4">
            {currentStory.caption}
          </div>
        )}

        {isOwnStory && !showViewers && (
          <button
            onClick={handleShowViewers}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-4 py-2 rounded-full z-10"
          >
            👁 Seen by
          </button>
        )}

        {showViewers && (
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[50%] overflow-y-auto z-20">
            <div className="sticky top-0 bg-white flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-medium text-gray-800">
                Seen by {viewers.length}
              </span>
              <button
                onClick={handleCloseViewers}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            {viewersLoading && (
              <p className="text-gray-400 text-sm text-center py-4">Loading...</p>
            )}
            {!viewersLoading && viewers.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                No views yet
              </p>
            )}
            {!viewersLoading &&
              viewers.map((v) => (
                <div
                  key={v.viewerId}
                  className="flex items-center gap-3 px-4 py-2"
                >
                  <img
                    src={v.viewerAvatarUrl || '/default-avatar.png'}
                    alt={v.viewerUsername}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-800">
                    {v.viewerUsername}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StoryViewer
