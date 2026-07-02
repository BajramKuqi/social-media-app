import { useEffect, useRef, useState } from 'react'
import { viewStory, getStoryViewers, deleteStory } from '../api/stories'
import { getHighlights, createHighlight, addStoryToHighlight } from '../api/highlights'
import { useAuth } from '../context/AuthContext'

const STORY_DURATION_MS = 5000

function StoryViewer({ groups, startIndex, onClose, onStoryViewed, onStoryDeleted }) {
  const [groupIndex, setGroupIndex] = useState(startIndex)
  const [storyIndex, setStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showViewers, setShowViewers] = useState(false)
  const [viewers, setViewers] = useState([])
  const [viewersLoading, setViewersLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [showHighlightPanel, setShowHighlightPanel] = useState(false)
  const [highlights, setHighlights] = useState([])
  const [highlightsLoading, setHighlightsLoading] = useState(false)
  const [addedHighlightIds, setAddedHighlightIds] = useState(new Set())
  const [addingHighlightId, setAddingHighlightId] = useState(null)
  const [newHighlightTitle, setNewHighlightTitle] = useState('')
  const [creatingHighlight, setCreatingHighlight] = useState(false)

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
    setShowMenu(false)
    setShowHighlightPanel(false)
    setAddedHighlightIds(new Set())

    startProgress()

    return () => clearInterval(intervalRef.current)
  }, [groupIndex, storyIndex])

  function startProgress() {
    setProgress(0)
    const startTime = Date.now()
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min((elapsed / STORY_DURATION_MS) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        goToNext()
      }
    }, 50)
  }

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
    startProgress()
  }

  function handleToggleMenu() {
    if (showMenu) {
      setShowMenu(false)
      startProgress()
    } else {
      clearInterval(intervalRef.current)
      setShowMenu(true)
    }
  }

  async function handleOpenHighlightPanel() {
    setShowMenu(false)
    setShowHighlightPanel(true)
    setHighlightsLoading(true)
    try {
      const data = await getHighlights()
      setHighlights(data)
    } catch (err) {
      setHighlights([])
    } finally {
      setHighlightsLoading(false)
    }
  }

  function handleCloseHighlightPanel() {
    setShowHighlightPanel(false)
    setNewHighlightTitle('')
    startProgress()
  }

  async function handleAddExisting(highlightId) {
    if (!currentStory || addingHighlightId) return
    setAddingHighlightId(highlightId)
    try {
      const updated = await addStoryToHighlight(highlightId, currentStory.id)
      setHighlights((prev) => prev.map((h) => (h.id === highlightId ? updated : h)))
      setAddedHighlightIds((prev) => new Set(prev).add(highlightId))
    } catch (err) {
      alert('Failed to add to highlight. Please try again.')
    } finally {
      setAddingHighlightId(null)
    }
  }

  async function handleCreateHighlight(e) {
    e.preventDefault()
    const title = newHighlightTitle.trim()
    if (!currentStory || !title || creatingHighlight) return
    setCreatingHighlight(true)
    try {
      const created = await createHighlight(title, currentStory.id)
      setHighlights((prev) => [...prev, created])
      setAddedHighlightIds((prev) => new Set(prev).add(created.id))
      setNewHighlightTitle('')
    } catch (err) {
      alert('Failed to create highlight. Please try again.')
    } finally {
      setCreatingHighlight(false)
    }
  }

  async function handleDelete() {
    if (!currentStory || deleting) return
    const confirmed = window.confirm('Delete this story? This cannot be undone.')
    if (!confirmed) {
      startProgress()
      return
    }

    setDeleting(true)
    setShowMenu(false)
    clearInterval(intervalRef.current)

    const deletedAuthorId = currentGroup.authorId
    const deletedStoryId = currentStory.id
    const wasLastInGroup = storyIndex === currentGroup.stories.length - 1

    try {
      await deleteStory(deletedStoryId)
      onStoryDeleted(deletedAuthorId, deletedStoryId)

      if (!wasLastInGroup) {
        startProgress()
      } else if (groupIndex < groups.length - 1) {
        setGroupIndex(groupIndex + 1)
        setStoryIndex(0)
      } else if (storyIndex > 0) {
        setStoryIndex(storyIndex - 1)
      } else if (groupIndex > 0) {
        setGroupIndex(groupIndex - 1)
        setStoryIndex(0)
      } else {
        onClose()
      }
    } catch (err) {
      alert('Failed to delete story. Please try again.')
      startProgress()
    } finally {
      setDeleting(false)
    }
  }

  if (!currentStory) return null

  const overlaysActive = showViewers || showMenu || showHighlightPanel

  return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
          {isOwnStory && (
              <div className="relative">
                <button
                    onClick={handleToggleMenu}
                    className="text-white text-2xl leading-none px-1"
                    aria-label="Story options"
                >
                  &#8942;
                </button>
                {showMenu && (
                    <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg overflow-hidden w-44 text-left">
                      <button
                          onClick={handleOpenHighlightPanel}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100"
                      >
                        Add to Highlight
                      </button>
                      <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
                      >
                        {deleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                )}
                {showHighlightPanel && (
                    <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg overflow-hidden w-64 text-left max-h-96 flex flex-col">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-800">Add to Highlight</span>
                        <button
                            onClick={handleCloseHighlightPanel}
                            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                        >
                          &times;
                        </button>
                      </div>

                      <div className="overflow-y-auto flex-1">
                        {highlightsLoading && (
                            <p className="text-gray-400 text-sm text-center py-4">Loading...</p>
                        )}
                        {!highlightsLoading && highlights.length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-4 px-4">
                              No highlights yet. Create your first one below.
                            </p>
                        )}
                        {!highlightsLoading &&
                            highlights.map((h) => {
                              const added = addedHighlightIds.has(h.id)
                              const isAdding = addingHighlightId === h.id
                              return (
                                  <button
                                      key={h.id}
                                      onClick={() => !added && handleAddExisting(h.id)}
                                      disabled={added || isAdding}
                                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 disabled:cursor-default"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                      {h.coverImageUrl && (
                                          <img
                                              src={h.coverImageUrl}
                                              alt={h.title}
                                              className="w-full h-full object-cover"
                                          />
                                      )}
                                    </div>
                                    <span className="text-sm text-gray-800 truncate flex-1 text-left">
                            {h.title}
                          </span>
                                    <span className="text-xs text-gray-400">
                            {isAdding ? '...' : added ? 'Added \u2713' : 'Add'}
                          </span>
                                  </button>
                              )
                            })}
                      </div>

                      <form
                          onSubmit={handleCreateHighlight}
                          className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100"
                      >
                        <input
                            type="text"
                            value={newHighlightTitle}
                            onChange={(e) => setNewHighlightTitle(e.target.value)}
                            placeholder="New highlight name"
                            maxLength={30}
                            className="flex-1 text-sm px-2 py-1.5 border border-gray-200 rounded outline-none focus:border-purple-400"
                        />
                        <button
                            type="submit"
                            disabled={!newHighlightTitle.trim() || creatingHighlight}
                            className="text-sm text-purple-600 font-medium disabled:opacity-40 flex-shrink-0"
                        >
                          {creatingHighlight ? '...' : 'Create'}
                        </button>
                      </form>
                    </div>
                )}
              </div>
          )}
          <button
              onClick={onClose}
              className="text-white text-2xl leading-none"
          >
            &times;
          </button>
        </div>

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
          {!overlaysActive && (
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
          {currentStory.caption && !overlaysActive && (
              <div className="absolute bottom-16 left-0 right-0 text-center text-white text-sm px-4">
                {currentStory.caption}
              </div>
          )}

          {isOwnStory && !overlaysActive && (
              <button
                  onClick={handleShowViewers}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-4 py-2 rounded-full z-10"
              >
                &uarr; Seen by
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
                    &times;
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
