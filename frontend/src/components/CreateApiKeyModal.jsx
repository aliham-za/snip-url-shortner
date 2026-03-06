import { useState } from 'react'
import { HiClipboardCopy, HiExclamation } from 'react-icons/hi'
import { apiKeysAPI } from '../lib/api'
import toast from 'react-hot-toast'

export default function CreateApiKeyModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [rawKey, setRawKey] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {}
      if (name.trim()) payload.name = name.trim()
      if (expiresAt) {
        const expiry = new Date(expiresAt)
        if (expiry <= new Date()) {
          toast.error('Expiry date must be in the future')
          setLoading(false)
          return
        }
        payload.expires_at = expiry.toISOString()
      }

      const { data } = await apiKeysAPI.create(payload)
      setRawKey(data.raw_key)
      onCreated(data)
      toast.success('API key created')
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0] || err.response?.data?.error || 'Failed to create API key')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setExpiresAt('')
    setRawKey(null)
    onClose()
  }

  const copyKey = () => {
    navigator.clipboard.writeText(rawKey).then(
      () => toast.success('API key copied!'),
      () => toast.error('Failed to copy')
    )
  }

  const minDate = new Date(Date.now() + 60000).toISOString().slice(0, 16)

  if (rawKey) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleClose}>
        <div className="bg-white rounded-xl shadow-lg max-w-lg w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-xl font-bold text-gray-900 mb-4">API Key Created</h2>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <HiExclamation className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                Save this API key now. It won't be shown again.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <code className="flex-1 text-sm bg-gray-900 text-green-400 px-4 py-3 rounded-lg font-mono break-all">
              {rawKey}
            </code>
            <button
              onClick={copyKey}
              className="shrink-0 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 cursor-pointer"
              title="Copy key"
            >
              <HiClipboardCopy className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 font-medium mb-2">Usage Example</p>
            <code className="text-xs text-gray-700 font-mono">
              curl -X POST -H "X-Api-Key: {rawKey.slice(0, 15)}..." \<br />
              &nbsp;&nbsp;-d '{"{"}\"original_url\":\"https://example.com\"{"}"}' \<br />
              &nbsp;&nbsp;http://localhost:3000/api/v1/external/shorten
            </code>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 cursor-pointer"
          >
            I've saved my key
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create API Key</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production, My App"
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expires (optional)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={minDate}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
