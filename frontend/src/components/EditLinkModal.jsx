import { useState, useEffect } from 'react'
import { linksAPI, subdomainsAPI } from '../lib/api'
import toast from 'react-hot-toast'

export default function EditLinkModal({ isOpen, link, onClose, onUpdated }) {
  const [form, setForm] = useState({ original_url: '', custom_slug: '', title: '', expires_at: '', subdomain: '' })
  const [loading, setLoading] = useState(false)
  const [subdomains, setSubdomains] = useState([])

  useEffect(() => {
    if (link) {
      setForm({
        original_url: link.original_url || '',
        custom_slug: link.custom_slug || '',
        title: link.title || '',
        expires_at: link.expires_at ? new Date(link.expires_at).toISOString().slice(0, 16) : '',
        subdomain: link.subdomain_name || '',
      })
    }
  }, [link])

  useEffect(() => {
    if (isOpen) {
      subdomainsAPI.list().then(({ data }) => {
        const parsed = Array.isArray(data) ? data : JSON.parse(data)
        setSubdomains(parsed)
      }).catch(() => {})
    }
  }, [isOpen])

  if (!isOpen || !link) return null

  const minExpiry = new Date(Date.now() + 60000).toISOString().slice(0, 16)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.expires_at && new Date(form.expires_at) <= new Date()) {
      toast.error('Expiry date must be in the future')
      return
    }

    setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.custom_slug) payload.custom_slug = ''
      if (!payload.expires_at) payload.expires_at = null
      const { data } = await linksAPI.update(link.id, payload)
      toast.success('Link updated!')
      onUpdated(data)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.errors?.[0] || err.response?.data?.error || 'Failed to update link'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 m-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Link</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
            <input
              type="url"
              value={form.original_url}
              onChange={(e) => setForm({ ...form, original_url: e.target.value })}
              placeholder="https://example.com/very-long-url"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="My awesome link"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              maxLength={255}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom slug (optional)</label>
            <input
              type="text"
              value={form.custom_slug}
              onChange={(e) => setForm({ ...form, custom_slug: e.target.value.replace(/[^a-zA-Z0-9\-_]/g, '') })}
              placeholder="my-link"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              maxLength={20}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Subdomain (coming soon)</label>
            <select
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
            >
              <option>Coming soon</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">Custom subdomain support is coming soon.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expires at (optional)
              {link.expires_at && new Date(link.expires_at) < new Date() && (
                <span className="text-red-500 ml-2 text-xs">Currently expired — set a new future date to reactivate</span>
              )}
            </label>
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              min={minExpiry}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            {form.expires_at && (
              <button
                type="button"
                onClick={() => setForm({ ...form, expires_at: '' })}
                className="text-xs text-gray-400 hover:text-gray-600 mt-1 cursor-pointer"
              >
                Remove expiry
              </button>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
