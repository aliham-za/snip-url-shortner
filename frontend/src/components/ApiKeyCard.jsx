import { useState } from 'react'
import { HiClipboardCopy, HiTrash } from 'react-icons/hi'
import { apiKeysAPI } from '../lib/api'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  active: 'bg-green-50 text-green-700',
  expired: 'bg-yellow-50 text-yellow-700',
  revoked: 'bg-red-50 text-red-700',
}

export default function ApiKeyCard({ apiKey, rawKey, onRevoked }) {
  const [revoking, setRevoking] = useState(false)

  const handleRevoke = async () => {
    setRevoking(true)
    try {
      await apiKeysAPI.revoke(apiKey.id)
      toast.success('API key revoked')
      onRevoked(apiKey.id)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to revoke key')
    } finally {
      setRevoking(false)
    }
  }

  const copyKey = () => {
    const textToCopy = rawKey || apiKey.key_prefix
    navigator.clipboard.writeText(textToCopy).then(
      () => toast.success(rawKey ? 'Full API key copied!' : 'Key prefix copied (full key no longer available)'),
      () => toast.error('Failed to copy')
    )
  }

  const statusStyle = STATUS_STYLES[apiKey.status] || STATUS_STYLES.active

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {apiKey.name || 'Unnamed Key'}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}>
              {apiKey.status}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <code className={`text-sm px-2 py-1 rounded font-mono ${rawKey ? 'text-green-700 bg-green-50 border border-green-200' : 'text-gray-600 bg-gray-100'}`}>
              {rawKey || `${apiKey.key_prefix}••••••••`}
            </code>
            <button
              onClick={copyKey}
              className="text-gray-400 hover:text-indigo-600 cursor-pointer"
              title={rawKey ? 'Copy full API key' : 'Copy key prefix'}
            >
              <HiClipboardCopy className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Created {new Date(apiKey.created_at).toLocaleDateString()}</span>
            {apiKey.expires_at && (
              <span>
                {apiKey.status === 'expired' ? 'Expired' : 'Expires'}{' '}
                {new Date(apiKey.expires_at).toLocaleDateString()}
              </span>
            )}
            {!apiKey.expires_at && <span>Never expires</span>}
          </div>
        </div>

        {apiKey.status === 'active' && (
          <button
            onClick={handleRevoke}
            disabled={revoking}
            className="text-red-400 hover:text-red-600 disabled:opacity-50 cursor-pointer p-1"
            title="Revoke key"
          >
            <HiTrash className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
