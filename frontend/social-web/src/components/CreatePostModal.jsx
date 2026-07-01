import { useState, useRef } from 'react'
import { createPost } from '../api/posts'

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h2 className="font-medium text-gray-800">Create new post</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-4 flex flex-col gap-3">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full max-h-72 object-cover rounded"
                            onClick={() => fileInputRef.current.click()}
                        />
                    ) : (
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="w-full h-48 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-sm hover:border-purple-400 hover:text-purple-500"
                        >
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
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-purple-400"
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !file}
                        className="w-full bg-purple-600 text-white rounded py-2 text-sm font-medium disabled:opacity-50 hover:bg-purple-700"
                    >
                        {submitting ? 'Posting...' : 'Share'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreatePostModal