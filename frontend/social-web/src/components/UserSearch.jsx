import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchUsers } from '../api/users'

function UserSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [open, setOpen] = useState(false)
    const containerRef = useRef(null)

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

    function handleSelect() {
        setQuery('')
        setResults([])
        setOpen(false)
    }

    return (
        <div ref={containerRef} className="relative w-48">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && setOpen(true)}
                placeholder="Search users..."
                className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
            {open && results.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-64 overflow-y-auto">
                    {results.map((user) => (
                        <Link
                            key={user.id}
                            to={`/profile/${user.username}`}
                            onClick={handleSelect}
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            {user.username}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default UserSearch