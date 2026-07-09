import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { getReelsFeed } from '../api/reels'
import ReelCard from '../components/ReelCard'
import CreateReelModal from '../components/CreateReelModal'
import SettingsMenu from '../components/SettingsMenu'

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
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}

                    <SettingsMenu />
                </nav>
            </aside>

            <div className="flex-1 flex justify-center px-6 py-6">
                <div className="w-full max-w-3xl flex flex-col gap-4">
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