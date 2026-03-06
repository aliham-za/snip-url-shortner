import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiClipboardCopy, HiExternalLink, HiTrash, HiChartBar, HiPencil } from 'react-icons/hi'
import { linksAPI } from '../lib/api'
import toast from 'react-hot-toast'

export default function LinkCard({ link, onUpdate, onDelete, onEdit }) {
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const shortUrl = link.short_url

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl).then(
      () => toast.success('Copied!'),
      () => toast.error('Failed to copy')
    )
  }

  const handleToggle = async () => {
    setToggling(true)
    try {
      const { data } = await linksAPI.toggle(link.id)
      onUpdate(data)
    } catch {
      toast.error('Failed to toggle link')
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await linksAPI.delete(link.id)
      onDelete(link.id)
      toast.success('Link deleted')
    } catch {
      toast.error('Failed to delete link')
    } finally {
      setDeleting(false)
    }
  }

  const isExpired = link.expires_at ? new Date(link.expires_at) < new Date() : false

  return (
    <div className={`bg-white rounded-xl border p-5 ${!link.is_active || isExpired ? 'opacity-60 border-gray-200' : 'border-gray-200 hover:border-gray-300'} transition-all`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">
              {link.title || link.original_url}
            </h3>
            {!link.is_active && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full shrink-0">Disabled</span>
            )}
            {isExpired && (
              <span className="text-xs px-2 py-0.5 bg-red-50 text-red-500 rounded-full shrink-0">Expired</span>
            )}
          </div>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 font-medium text-sm hover:underline inline-flex items-center gap-1"
          >
            {shortUrl}
            <HiExternalLink className="w-3.5 h-3.5" />
          </a>
          <p className="text-xs text-gray-400 mt-1 truncate">{link.original_url}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={copyToClipboard} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 cursor-pointer" title="Copy short URL">
            <HiClipboardCopy className="w-5 h-5" />
          </button>
          <button onClick={() => onEdit(link)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 cursor-pointer" title="Edit link">
            <HiPencil className="w-5 h-5" />
          </button>
          <Link to={`/links/${link.id}/analytics`} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Analytics">
            <HiChartBar className="w-5 h-5" />
          </Link>
          <button onClick={handleDelete} disabled={deleting} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 cursor-pointer disabled:opacity-50" title="Delete link">
            <HiTrash className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
          <span>{link.total_clicks ?? 0} clicks</span>
          <span>{link.unique_clicks ?? 0} unique</span>
          <span>{link.clicks_today ?? 0} today</span>
          {link.expires_at && (
            <span className={isExpired ? 'text-red-400' : ''}>
              {isExpired ? 'Expired' : 'Expires'} {new Date(link.expires_at).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="ml-auto">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
              link.is_active ? 'bg-green-500' : 'bg-gray-300'
            }`}
            title={link.is_active ? 'Disable link' : 'Enable link'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                link.is_active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
