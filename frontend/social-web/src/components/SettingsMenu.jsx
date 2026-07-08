import { useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'

function SettingsMenu() {
    const { logoutUser } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef(null)

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="p-2 rounded-full hover:bg-mint-100 transition-colors"
                aria-label="Settings"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-ink-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-lg overflow-hidden z-20 border border-mint-100">
                        <button
                            onClick={() => {
                                setIsOpen(false)
                                logoutUser()
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-clay-500 hover:bg-mint-100 transition-colors"
                        >
                            Log out
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default SettingsMenu