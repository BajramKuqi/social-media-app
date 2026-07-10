import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { searchUsers } from '../api/users'
import {
    getMessages,
    pollMessages,
    sendMessage,
    sendDirectMessage,
    getDirectConversation,
    getConversations,
    markConversationAsRead,
    deleteMessage,
    deleteConversation,
    exitGroup,
    addGroupMember,
} from '../api/messages'

const POLL_INTERVAL_MS = 3000

function BackIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
        </svg>
    )
}

function ConversationPage() {
    const { conversationId, userId } = useParams()
    const { username } = useAuth()
    const navigate = useNavigate()

    const [resolvedConversationId, setResolvedConversationId] = useState(
        conversationId ? Number(conversationId) : null
    )
    const [otherUsername, setOtherUsername] = useState(null)
    const [isGroupChat, setIsGroupChat] = useState(false)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const bottomRef = useRef(null)
    const lastMessageIdRef = useRef(null)
    const [showMenu, setShowMenu] = useState(false)

    // add-member popover state
    const [showAddMember, setShowAddMember] = useState(false)
    const [addQuery, setAddQuery] = useState('')
    const [addResults, setAddResults] = useState([])
    const [adding, setAdding] = useState(false)

    // figure out whether this is a group chat + its display name
    useEffect(() => {
        if (!resolvedConversationId) return
        let cancelled = false
        getConversations()
            .then((list) => {
                if (cancelled) return
                const match = list.find((c) => c.id === resolvedConversationId)
                if (match) {
                    setIsGroupChat(match.group)
                    setOtherUsername(match.displayName)
                }
            })
            .catch((err) => console.error('Failed to load conversation meta', err))
        return () => {
            cancelled = true
        }
    }, [resolvedConversationId])

    // initial load
    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            setError('')
            try {
                if (conversationId) {
                    const data = await getMessages(Number(conversationId), 0, 50)
                    if (cancelled) return
                    const ordered = [...data.content].reverse()
                    setMessages(ordered)
                    if (ordered.length > 0) {
                        lastMessageIdRef.current = ordered[ordered.length - 1].id
                    }
                    await markConversationAsRead(Number(conversationId))
                } else if (userId) {
                    const existing = await getDirectConversation(Number(userId))
                    if (cancelled) return
                    if (existing) {
                        setResolvedConversationId(existing.id)
                        setOtherUsername(existing.displayName)
                        const data = await getMessages(existing.id, 0, 50)
                        if (cancelled) return
                        const ordered = [...data.content].reverse()
                        setMessages(ordered)
                        if (ordered.length > 0) {
                            lastMessageIdRef.current = ordered[ordered.length - 1].id
                        }
                        await markConversationAsRead(existing.id)
                    }
                }
            } catch (err) {
                if (!cancelled) setError('Failed to load conversation')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [conversationId, userId])

    // fast polling for new messages while this conversation is open
    useEffect(() => {
        if (!resolvedConversationId) return
        const interval = setInterval(async () => {
            try {
                const afterId = lastMessageIdRef.current ?? 0
                const newMessages = await pollMessages(resolvedConversationId, afterId)
                if (newMessages.length > 0) {
                    setMessages((prev) => [...prev, ...newMessages])
                    lastMessageIdRef.current = newMessages[newMessages.length - 1].id
                    markConversationAsRead(resolvedConversationId).catch(() => {})
                }
            } catch (err) {
                console.error('Poll failed', err)
            }
        }, POLL_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [resolvedConversationId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // debounced user search for the add-member popover
    useEffect(() => {
        if (!showAddMember) return
        const trimmed = addQuery.trim()
        if (!trimmed) {
            setAddResults([])
            return
        }
        const timeout = setTimeout(async () => {
            try {
                const data = await searchUsers(trimmed)
                setAddResults(data)
            } catch (err) {
                console.error('Search failed', err)
            }
        }, 300)
        return () => clearTimeout(timeout)
    }, [addQuery, showAddMember])

    async function handleSend() {
        const trimmed = input.trim()
        if (!trimmed || sending) return
        setSending(true)
        try {
            let saved
            if (resolvedConversationId) {
                saved = await sendMessage(resolvedConversationId, trimmed)
            } else if (userId) {
                saved = await sendDirectMessage(Number(userId), trimmed)
                setResolvedConversationId(saved.conversationId)
            }
            setMessages((prev) => [...prev, saved])
            lastMessageIdRef.current = saved.id
            setInput('')
        } catch (err) {
            console.error('Failed to send message', err)
        } finally {
            setSending(false)
        }
    }

    async function handleDeleteMessage(messageId) {
        try {
            await deleteMessage(messageId)
            setMessages((prev) => prev.filter((m) => m.id !== messageId))
        } catch (err) {
            console.error('Failed to delete message', err)
        }
    }

    async function handleDeleteConversation() {
        if (!resolvedConversationId) return
        if (!window.confirm('Delete this chat? It will be removed from your inbox.')) return
        try {
            await deleteConversation(resolvedConversationId)
            navigate('/messages')
        } catch (err) {
            console.error('Failed to delete conversation', err)
        }
    }

    async function handleExitGroup() {
        if (!resolvedConversationId) return
        if (!window.confirm('Exit this group?')) return
        try {
            await exitGroup(resolvedConversationId)
            navigate('/messages')
        } catch (err) {
            console.error('Failed to exit group', err)
        }
    }

    async function handleAddMember(user) {
        if (!resolvedConversationId || adding) return
        setAdding(true)
        try {
            await addGroupMember(resolvedConversationId, user.id)
            setShowAddMember(false)
            setAddQuery('')
            setAddResults([])
        } catch (err) {
            console.error('Failed to add member', err)
        } finally {
            setAdding(false)
        }
    }

    const headerName = otherUsername || (conversationId ? '' : userId ? '' : '')

    return (
        <div className="min-h-screen bg-sage-50 flex flex-col">
            <div className="bg-white border-b border-sage-200 px-4 py-3 grid grid-cols-3 items-center">
                <div className="justify-self-start">
                    <button onClick={() => navigate('/messages')} className="text-ink-500 hover:text-sunset-600 transition-colors">
                        <BackIcon />
                    </button>
                </div>
                <span className="font-medium text-ink-800 font-display justify-self-center truncate">{headerName || 'Conversation'}</span>
                <div className="justify-self-end">
                    {resolvedConversationId && (
                        <div className="relative">
                            <button onClick={() => setShowMenu((prev) => !prev)} className="text-ink-500 hover:text-ink-700 px-2">
                                &#8942;
                            </button>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg overflow-hidden w-44 z-20 border border-sage-100">
                                        {isGroupChat && (
                                            <button
                                                onClick={() => {
                                                    setShowMenu(false)
                                                    setShowAddMember(true)
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-ink-700 hover:bg-sage-50"
                                            >
                                                Add people
                                            </button>
                                        )}
                                        {isGroupChat && (
                                            <button
                                                onClick={() => {
                                                    setShowMenu(false)
                                                    handleExitGroup()
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-ink-700 hover:bg-sage-50"
                                            >
                                                Exit group
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setShowMenu(false)
                                                handleDeleteConversation()
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-clay-500 hover:bg-sage-50"
                                        >
                                            Delete chat
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showAddMember && (
                <div className="fixed inset-0 bg-ink-800/60 z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-4 flex flex-col gap-3 border border-sage-100">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-ink-800 font-display">Add people</span>
                            <button
                                onClick={() => {
                                    setShowAddMember(false)
                                    setAddQuery('')
                                    setAddResults([])
                                }}
                                className="text-ink-400 hover:text-ink-600 text-xl leading-none"
                            >
                                &times;
                            </button>
                        </div>
                        <input
                            type="text"
                            value={addQuery}
                            onChange={(e) => setAddQuery(e.target.value)}
                            placeholder="Search users..."
                            className="border border-sage-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sunset-500/30"
                        />
                        <div className="max-h-56 overflow-y-auto flex flex-col">
                            {addResults.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => handleAddMember(u)}
                                    disabled={adding}
                                    className="text-left px-3 py-2 text-sm text-ink-700 hover:bg-sage-50 rounded-lg disabled:opacity-40"
                                >
                                    {u.username}
                                </button>
                            ))}
                            {addQuery.trim() && addResults.length === 0 && (
                                <p className="text-ink-400 text-sm px-3 py-2">No users found</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2 w-full">
                {loading && <p className="text-ink-400 text-center py-6">Loading...</p>}
                {error && <p className="text-clay-500 text-center py-6">{error}</p>}
                {!loading && !error && messages.length === 0 && (
                    <p className="text-ink-400 text-center py-10">Say hello 👋</p>
                )}
                {messages.map((m) => {
                    if (m.type === 'SYSTEM') {
                        return (
                            <div key={m.id} className="text-center text-xs text-ink-400 my-1">
                                {m.content}
                            </div>
                        )
                    }
                    const isMine = m.senderUsername === username
                    return (
                        <div key={m.id} className={`flex items-center gap-1 group ${isMine ? 'justify-end' : 'justify-start'}`}>
                            {isMine && (
                                <button
                                    onClick={() => handleDeleteMessage(m.id)}
                                    className="opacity-0 group-hover:opacity-100 text-ink-300 hover:text-clay-500 text-xs transition-opacity"
                                >
                                    delete
                                </button>
                            )}
                            <div
                                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                                    isMine
                                        ? 'bg-sunset-600 text-white rounded-br-sm'
                                        : 'bg-white text-ink-800 border border-sage-200 rounded-bl-sm'
                                }`}
                            >
                                {m.content}
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </div>

            <div className="bg-white border-t border-sage-200 px-6 py-3 w-full flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Message..."
                    className="flex-1 border border-sage-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sunset-500/30"
                />
                <button
                    onClick={handleSend}
                    disabled={sending || !input.trim()}
                    className="text-sunset-600 font-medium text-sm disabled:opacity-40 px-2"
                >
                    Send
                </button>
            </div>
        </div>
    )
}

export default ConversationPage