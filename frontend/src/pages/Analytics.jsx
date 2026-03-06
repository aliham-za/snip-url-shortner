import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { analyticsAPI, linksAPI } from '../lib/api'
import { HiArrowLeft, HiClipboardCopy } from 'react-icons/hi'
import ClicksLineChart from '../components/ClicksLineChart'
import ReferrerBarChart from '../components/ReferrerBarChart'
import CountryTable from '../components/CountryTable'
import BrowserPieChart from '../components/BrowserPieChart'
import toast from 'react-hot-toast'

export default function Analytics() {
  const { id } = useParams()
  const [link, setLink] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [days, setDays] = useState(30)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const fetchData = async () => {
      try {
        const [linkRes, analyticsRes] = await Promise.all([
          linksAPI.get(id),
          analyticsAPI.get(id, { days }),
        ])
        if (cancelled || !mountedRef.current) return
        setLink(linkRes.data)
        setAnalytics(analyticsRes.data)
      } catch (err) {
        if (cancelled || !mountedRef.current) return
        setError('Failed to load analytics')
        toast.error('Failed to load analytics')
      } finally {
        if (!cancelled && mountedRef.current) setLoading(false)
      }
    }
    fetchData()

    return () => { cancelled = true }
  }, [id, days])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-40"></div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-32"></div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-80"></div>
        </div>
      </div>
    )
  }

  if (error || !link || !analytics) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 mb-4">{error || 'Link not found'}</p>
        <Link to="/dashboard" className="text-indigo-600 hover:underline">Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4">
        <HiArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-gray-900 truncate">{link.title || link.original_url}</h1>
            <p className="text-sm text-gray-400 mt-1 break-all">{link.original_url}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(link.short_url).then(
                  () => toast.success('Copied!'),
                  () => toast.error('Failed to copy')
                )
              }}
              className="mt-2 flex items-center gap-1 text-indigo-600 text-sm hover:underline cursor-pointer"
            >
              <HiClipboardCopy className="w-4 h-4" />
              {link.short_url}
            </button>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-3xl font-bold text-gray-900">{(analytics.total_clicks ?? 0).toLocaleString()}</p>
            <p className="text-sm text-gray-500">total clicks</p>
            <p className="text-sm text-gray-400 mt-1">{(analytics.unique_clicks ?? 0).toLocaleString()} unique</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            disabled={loading}
            className={`px-4 py-1.5 rounded-lg text-sm cursor-pointer disabled:opacity-50 ${
              days === d ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {d} days
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <ClicksLineChart data={analytics.clicks_over_time} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReferrerBarChart data={analytics.top_referrers} />
          <BrowserPieChart data={analytics.top_browsers} osData={analytics.top_os} />
        </div>
        <CountryTable data={analytics.top_countries} />
      </div>
    </div>
  )
}
