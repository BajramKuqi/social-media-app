import { useEffect, useState } from 'react'
import { getReelsFeed } from '../api/reels'
import ReelCard from '../components/ReelCard'
import CreateReelModal from '../components/CreateReelModal'

function ReelsPage() {
    const [reels, setReels] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)

    useEffect(() => {
        let cancelled = false
        async function loadFeed() {
            setLoading(true)
            setError('')
            try {
                const data = await getReelsFeed(0, 10)
                if (!cancelled) {
                    setReels(data.content)
                }
            } catch (err) {
                if (!cancelled) {
                    setError('Failed to load reels')
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
    }, [])

    function handleReelCreated(newReel) {
        setReels((prev) => [newReel, ...prev])
    }

    return (
        <div className="min-h-screen bg-sage-50 px-4 py-6">
            <div className="max-w-md mx-auto flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-display font-semibold text-ink-800">Reels</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-mint-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-mint-600 transition-colors shadow-sm"
                    >
                        + New Reel
                    </button>
                </div>
                {loading && <p className="text-ink-500 text-center">Loading...</p>}
                {error && <p className="text-clay-500 text-center">{error}</p>}
                {!loading && !error && reels.length === 0 && (
                    <p className="text-ink-500 text-center">No reels yet.</p>
                )}
                {reels.map((reel) => (
                    <ReelCard key={reel.id} reel={reel} />
                ))}
            </div>
            {showCreateModal && (
                <CreateReelModal
                    onClose={() => setShowCreateModal(false)}
                    onReelCreated={handleReelCreated}
                />
            )}
        </div>
    )
}

export default ReelsPage