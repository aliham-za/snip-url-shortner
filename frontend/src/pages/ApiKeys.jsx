import { useState, useEffect } from 'react'
import { HiPlus, HiKey } from 'react-icons/hi'
import { apiKeysAPI } from '../lib/api'
import ApiKeyCard from '../components/ApiKeyCard'
import CreateApiKeyModal from '../components/CreateApiKeyModal'
import toast from 'react-hot-toast'

export default function ApiKeys() {
  const [keys, setKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [rawKeys, setRawKeys] = useState({})

  useEffect(() => {
    fetchKeys()
  }, [])

  const fetchKeys = async () => {
    try {
      const { data } = await apiKeysAPI.list()
      setKeys(Array.isArray(data) ? data : JSON.parse(data))
    } catch (err) {
      toast.error('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  const handleCreated = (newKey) => {
    const { raw_key, ...keyData } = newKey
    setRawKeys((prev) => ({ ...prev, [keyData.id]: raw_key }))
    setKeys((prev) => [keyData, ...prev])
  }

  const handleRevoked = (id) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, is_active: false, status: 'revoked' } : k))
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your API keys for external API access</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer text-sm"
        >
          <HiPlus className="w-4 h-4" />
          Create API Key
        </button>
      </div>

      <div className="mb-10">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 p-5 h-24" />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <HiKey className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No API keys yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer text-sm"
            >
              Create your first API key
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <ApiKeyCard key={key.id} apiKey={key} rawKey={rawKeys[key.id]} onRevoked={handleRevoked} />
            ))}
          </div>
        )}
      </div>

      <CreateApiKeyModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
