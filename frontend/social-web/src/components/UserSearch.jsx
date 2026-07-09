import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchUsers } from '../api/users'
function UserSearch({ mode = 'profile', placeholder = 'Search users...' }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [open, setOpen] = useState(false)
    const containerRef = useRef(null)
    const navigate = useNavigate()
    useEffect(() => {
        const trimmed = query.trim()
        if (!trimmed) {
            setResults([])
            return
        }
        const timeout = setTimeout(async () => {
            try {
                const data = await searchUsers(trimmed)
                setResults(data)
                setOpen(true)
            } catch (err) {
                console.error('Search failed', err)
            }
        }, 300)
        return () => clearTimeout(timeout)
    }, [query])
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])
    function handleSelect(user) {
        setQuery('')
        setResults([])
        setOpen(false)
        if (mode === 'message') {
            navigate(`/messages/u/${user.id}`, { state: { username: user.username } })
        }
    }
    return (
        <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && setOpen(true)}
                placeholder={placeholder}
                className="w-full border border-sage-100 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500/30 bg-sage-50"
            />
            {open && results.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-mint-100 rounded-2xl shadow-lg z-50 max-h-64 overflow-y-auto">
                    {results.map((user) =>
                        mode === 'message' ? (
                            <button
                                key={user.id}
                                onClick={() => handleSelect(user)}
                                className="block w-full text-left px-4 py-2 text-sm text-ink-800 hover:bg-sage-50"
                            >
                                {user.username}
                            </button>
                        ) : (
                            <Link
                                key={user.id}
                                to={`/profile/${user.username}`}
                                onClick={() => handleSelect(user)}
                                className="block px-4 py-2 text-sm text-ink-800 hover:bg-sage-50"
                            >
                                {user.username}
                            </Link>
                        )
                    )}
                </div>
            )}
        </div>
    )
}
export default UserSearch