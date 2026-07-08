import { useState, useRef } from 'react'
import { createPost } from '../api/posts'

function CloseIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    )
}

function ImageIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
        </svg>
    )
}

function CreatePostModal({ onClose, onPostCreated }) {
    const [file, setFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [caption, setCaption] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef(null)

    function handleFileChange(e) {
        const selected = e.target.files[0]
        if (!selected) return
        setFile(selected)
        setPreviewUrl(URL.createObjectURL(selected))
        setError('')
    }

    async function handleSubmit() {
        if (!file) {
            setError('Please select an image')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            const newPost = await createPost(file, caption)
            onPostCreated(newPost)
            onClose()
        } catch (err) {
            setError('Failed to create post. Please try again.')
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-ink-800/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md flex flex-col border border-mint-100">
                <div className="flex items-center justify-between px-4 py-3 border-b border-mint-100">
                    <h2 className="font-display font-medium text-ink-800">Create new post</h2>
                    <button
                        onClick={onClose}
                        className="text-ink-500 hover:text-mint-600 transition-colors"
                    >
                        <CloseIcon />
                    </button>
                </div>
                <div className="p-4 flex flex-col gap-3">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full max-h-72 object-cover rounded-xl cursor-pointer"
                            onClick={() => fileInputRef.current.click()}
                        />
                    ) : (
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="w-full h-48 border-2 border-dashed border-ink-500/30 rounded-xl flex flex-col items-center justify-center gap-2 text-ink-500 text-sm hover:border-mint-500 hover:text-mint-600 transition-colors"
                        >
                            <ImageIcon />
                            Click to select an image
                        </button>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Write a caption..."
                        rows={3}
                        className="w-full border border-sage-100 rounded-xl px-3 py-2 text-sm text-ink-800 resize-none focus:outline-none focus:ring-2 focus:ring-mint-500/30"
                    />
                    {error && <p className="text-clay-500 text-sm">{error}</p>}
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !file}
                        className="w-full bg-mint-500 text-white rounded-full py-2 text-sm font-medium disabled:opacity-50 hover:bg-mint-600 transition-colors"
                    >
                        {submitting ? 'Posting...' : 'Share'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreatePostModal