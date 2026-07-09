import { useEffect, useRef, useState } from 'react'
import { deleteHighlightItem } from '../api/highlights'

const STORY_DURATION_MS = 5000

function HighlightViewer({ highlight, isOwner, onClose, onItemDeleted }) {
    const [stories, setStories] = useState(highlight.stories)
    const [storyIndex, setStoryIndex] = useState(0)
    const [progress, setProgress] = useState(0)
    const [showMenu, setShowMenu] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const intervalRef = useRef(null)

    const currentStory = stories[storyIndex]

    useEffect(() => {
        setShowMenu(false)
        startProgress()
        return () => clearInterval(intervalRef.current)
    }, [storyIndex])

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
        if (storyIndex < stories.length - 1) {
            setStoryIndex(storyIndex + 1)
        } else {
            onClose()
        }
    }

    function goToPrev() {
        clearInterval(intervalRef.current)
        if (storyIndex > 0) {
            setStoryIndex(storyIndex - 1)
        }
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

    async function handleDelete() {
        if (!currentStory || deleting) return
        const confirmed = window.confirm('Remove this photo from the highlight?')
        if (!confirmed) {
            startProgress()
            return
        }

        setDeleting(true)
        try {
            await deleteHighlightItem(highlight.id, currentStory.itemId)
            onItemDeleted && onItemDeleted(currentStory.itemId)

            const remaining = stories.filter((s) => s.itemId !== currentStory.itemId)
            if (remaining.length === 0) {
                onClose()
                return
            }
            setStories(remaining)
            setShowMenu(false)
            setStoryIndex((prev) => Math.min(prev, remaining.length - 1))
        } catch (err) {
            alert('Failed to remove from highlight. Please try again.')
            startProgress()
        } finally {
            setDeleting(false)
        }
    }

    if (!currentStory) return null

    return (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
                {isOwner && (
                    <div className="relative">
                        <button
                            onClick={handleToggleMenu}
                            className="text-white text-2xl leading-none px-1 transition-opacity hover:opacity-70"
                            aria-label="Highlight options"
                        >
                            &#8942;
                        </button>
                        {showMenu && (
                            <div className="absolute top-8 right-0 bg-surface border border-border-light rounded-xl shadow-lg overflow-hidden w-52 text-left">
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-sage-50 disabled:opacity-50 transition-colors"
                                >
                                    {deleting ? 'Removing...' : 'Remove from Highlight'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
                <button
                    onClick={onClose}
                    className="text-white text-2xl leading-none transition-opacity hover:opacity-70"
                >
                    &times;
                </button>
            </div>

            <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
                {stories.map((s, idx) => (
                    <div key={s.itemId} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-insta-blue transition-none"
                            style={{
                                width:
                                    idx < storyIndex ? '100%' : idx === storyIndex ? `${progress}%` : '0%',
                            }}
                        />
                    </div>
                ))}
            </div>

            <div className="absolute top-8 left-2 z-10">
                <span className="text-white text-sm font-medium font-display">{highlight.title}</span>
            </div>

            <div className="relative w-full max-w-md h-full flex items-center">
                {!showMenu && (
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
                {currentStory.caption && !showMenu && (
                    <div className="absolute bottom-16 left-0 right-0 text-center text-white text-sm px-4">
                        {currentStory.caption}
                    </div>
                )}
            </div>
        </div>
    )
}

export default HighlightViewer