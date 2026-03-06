import { useState, useEffect } from 'react'
import { HiPencil, HiTrash, HiCheck, HiX, HiPlus } from 'react-icons/hi'
import { subdomainsAPI } from '../lib/api'
import toast from 'react-hot-toast'

export default function SubdomainSection() {
  const [subdomains, setSubdomains] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    fetchSubdomains()
  }, [])

  const fetchSubdomains = async () => {
    try {
      const { data } = await subdomainsAPI.list()
      setSubdomains(Array.isArray(data) ? data : JSON.parse(data))
    } catch (err) {
      toast.error('Failed to load subdomains')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const { data } = await subdomainsAPI.create({ name: newName.trim().toLowerCase() })
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      setSubdomains((prev) => [parsed, ...prev])
      setNewName('')
      toast.success('Subdomain created')
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0] || err.response?.data?.error || 'Failed to create subdomain')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (sub) => {
    setEditingId(sub.id)
    setEditName(sub.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const handleUpdate = async (id) => {
    if (!editName.trim()) return
    try {
      const { data } = await subdomainsAPI.update(id, { name: editName.trim().toLowerCase() })
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      setSubdomains((prev) => prev.map((s) => (s.id === id ? parsed : s)))
      setEditingId(null)
      toast.success('Subdomain updated')
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0] || err.response?.data?.error || 'Failed to update subdomain')
    }
  }

  const handleDelete = async (id) => {
    try {
      await subdomainsAPI.delete(id)
      setSubdomains((prev) => prev.filter((s) => s.id !== id))
      toast.success('Subdomain deleted')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete subdomain')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Custom Subdomains</h2>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder="e.g. marketing"
          maxLength={63}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer text-sm"
        >
          <HiPlus className="w-4 h-4" />
          Add
        </button>
      </form>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-12" />
          ))}
        </div>
      ) : subdomains.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No subdomains yet. Create one above.</p>
      ) : (
        <div className="space-y-2">
          {subdomains.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              {editingId === sub.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate(sub.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  />
                  <button onClick={() => handleUpdate(sub.id)} className="text-green-600 hover:text-green-700 cursor-pointer">
                    <HiCheck className="w-5 h-5" />
                  </button>
                  <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <HiX className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <code className="text-sm font-mono text-indigo-600">{sub.name}</code>
                    <span className="text-xs text-gray-400">{sub.links_count || 0} links</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(sub)} className="text-gray-400 hover:text-indigo-600 cursor-pointer p-1" title="Edit">
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(sub.id)} className="text-gray-400 hover:text-red-600 cursor-pointer p-1" title="Delete">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
