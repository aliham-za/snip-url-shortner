import { useState, useEffect } from 'react'
import { linksAPI, subdomainsAPI } from '../lib/api'
import toast from 'react-hot-toast'

export default function CreateLinkModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({ original_url: '', custom_slug: '', title: '', expires_at: '', subdomain: '' })
  const [loading, setLoading] = useState(false)
  const [subdomains, setSubdomains] = useState([])

  useEffect(() => {
    if (isOpen) {
      subdomainsAPI.list().then(({ data }) => {
        const parsed = Array.isArray(data) ? data : JSON.parse(data)
        setSubdomains(parsed)
      }).catch(() => {})
    }
  }, [isOpen])

  if (!isOpen) return null

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
      if (!payload.custom_slug) delete payload.custom_slug
      if (!payload.title) delete payload.title
      if (!payload.expires_at) delete payload.expires_at
      if (!payload.subdomain) delete payload.subdomain
      const { data } = await linksAPI.create(payload)
      toast.success('Link created!')
      onCreated(data)
      setForm({ original_url: '', custom_slug: '', title: '', expires_at: '', subdomain: '' })
      onClose()
    } catch (err) {
      const msg = err.response?.data?.errors?.[0] || err.response?.data?.error || 'Failed to create link'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 m-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Shorten a URL</h3>
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
          {subdomains.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain (optional)</label>
              <select
                value={form.subdomain}
                onChange={(e) => setForm({ ...form, subdomain: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">None (default)</option>
                {subdomains.map((sub) => (
                  <option key={sub.id} value={sub.name}>{sub.name}</option>
                ))}
              </select>
              {form.subdomain && (
                <p className="text-xs text-gray-400 mt-1">
                  URL will be: <code className="text-indigo-500">{form.subdomain}.short.ly/slug</code>
                </p>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expires at (optional)</label>
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              min={minExpiry}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
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
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
