import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchUsers } from '../api/users'
import { createGroup } from '../api/messages'

function CreateGroupModal({ onClose, onCreated }) {
    const [name, setName] = useState('')
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [selected, setSelected] = useState([])
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState('')
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
                setResults(data.filter((u) => !selected.some((s) => s.id === u.id)))
            } catch (err) {
                console.error('Search failed', err)
            }
        }, 300)
        return () => clearTimeout(timeout)
    }, [query, selected])

    function addUser(user) {
        setSelected((prev) => [...prev, user])
        setQuery('')
        setResults([])
    }

    function removeUser(userId) {
        setSelected((prev) => prev.filter((u) => u.id !== userId))
    }

    async function handleCreate() {
        if (!name.trim() || selected.length < 2 || creating) return
        setCreating(true)
        setError('')
        try {
            const result = await createGroup(name.trim(), selected.map((u) => u.id))
            onCreated && onCreated()
            navigate(`/messages/c/${result.conversationId}`)
        } catch (err) {
            setError('Failed to create group')
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl w-full max-w-sm max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-800">New Group</span>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
                        &times;
                    </button>
                </div>

                <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Group name"
                        className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />

                    {selected.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selected.map((u) => (
                                <span
                                    key={u.id}
                                    className="flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-2 py-1 rounded-full"
                                >
                                    {u.username}
                                    <button onClick={() => removeUser(u.id)} className="text-purple-400 hover:text-purple-600">
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Add people..."
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                        />
                        {results.length > 0 && (
                            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded shadow-lg z-10 max-h-48 overflow-y-auto">
                                {results.map((u) => (
                                    <button
                                        key={u.id}
                                        onClick={() => addUser(u)}
                                        className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        {u.username}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>

                <div className="px-4 py-3 border-t border-gray-100">
                    <button
                        onClick={handleCreate}
                        disabled={!name.trim() || selected.length < 2 || creating}
                        className="w-full bg-purple-600 text-white rounded py-2 text-sm font-medium disabled:opacity-40"
                    >
                        {creating ? 'Creating...' : 'Create Group'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateGroupModal