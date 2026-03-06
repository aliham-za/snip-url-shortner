import { useState, useEffect, useCallback, useRef } from 'react'
import { HiPlus, HiSearch } from 'react-icons/hi'
import { linksAPI, dashboardAPI } from '../lib/api'
import useDebounce from '../lib/useDebounce'
import DashboardStats from '../components/DashboardStats'
import LinkCard from '../components/LinkCard'
import CreateLinkModal from '../components/CreateLinkModal'
import EditLinkModal from '../components/EditLinkModal'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [links, setLinks] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [showCreate, setShowCreate] = useState(false)
  const [editLink, setEditLink] = useState(null)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  const debouncedSearch = useDebounce(search, 350)
  const abortRef = useRef(null)

  const fetchData = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const [linksRes, statsRes] = await Promise.all([
        linksAPI.list({ search: debouncedSearch, sort, page, per_page: 20 }),
        dashboardAPI.stats(),
      ])
      if (controller.signal.aborted) return
      setLinks(linksRes.data.links || [])
      setMeta(linksRes.data.meta || null)
      setStats(statsRes.data)
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, sort, page])

  useEffect(() => {
    fetchData()
    return () => { if (abortRef.current) abortRef.current.abort() }
  }, [fetchData])

  const handleCreated = (newLink) => {
    fetchData() // Re-fetch to get correct sorted list
  }

  const handleUpdate = (updated) => {
    setLinks(links.map((l) => (l.id === updated.id ? updated : l)))
  }

  const handleDelete = (id) => {
    setLinks(links.filter((l) => l.id !== id))
    if (stats) setStats({ ...stats, total_links: stats.total_links - 1 })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer"
        >
          <HiPlus className="w-5 h-5" />
          New Link
        </button>
      </div>

      <DashboardStats data={stats} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search links..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1) }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="clicks">Most Clicked</option>
          <option value="expiring">Expiring Soon</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">🔗</p>
          <p className="text-gray-500 mb-4">
            {debouncedSearch ? 'No links match your search.' : 'No links yet. Create your first short link!'}
          </p>
          {!debouncedSearch && (
            <button
              onClick={() => setShowCreate(true)}
              className="text-indigo-600 hover:underline cursor-pointer"
            >
              Create Link
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onEdit={(l) => setEditLink(l)}
              />
            ))}
          </div>
          {meta && meta.total_pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: meta.total_pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className={`px-3 py-1 rounded-lg text-sm cursor-pointer ${
                    p === page ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <CreateLinkModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      <EditLinkModal isOpen={!!editLink} link={editLink} onClose={() => setEditLink(null)} onUpdated={handleUpdate} />
    </div>
  )
}
