import { useState, useEffect, useRef } from 'react'
import { HiPlay, HiClipboardCopy, HiClock, HiStatusOnline } from 'react-icons/hi'
import { apiKeysAPI } from '../lib/api'
import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1').replace(/\/api\/v1$/, '')

export default function Postman() {
  const [keys, setKeys] = useState([])
  const [apiKey, setApiKey] = useState('')
  const [form, setForm] = useState({ original_url: '', custom_slug: '', title: '', subdomain: '' })
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState(null)
  const [history, setHistory] = useState([])
  const responseRef = useRef(null)

  useEffect(() => {
    apiKeysAPI.list().then(({ data }) => {
      const parsed = Array.isArray(data) ? data : JSON.parse(data)
      const active = parsed.filter((k) => k.status === 'active')
      setKeys(active)
    }).catch(() => {})
  }, [])

  const endpoint = `${BASE_URL}/api/v1/external/shorten`

  const buildPayload = () => {
    const payload = {}
    if (form.original_url) payload.original_url = form.original_url
    if (form.custom_slug) payload.custom_slug = form.custom_slug
    if (form.title) payload.title = form.title
    if (form.subdomain) payload.subdomain = form.subdomain
    return payload
  }

  const handleSend = async () => {
    if (!form.original_url) {
      toast.error('URL is required')
      return
    }
    if (!apiKey) {
      toast.error('Enter your API key')
      return
    }

    setLoading(true)
    setResponse(null)
    setElapsed(null)

    const start = performance.now()
    const payload = buildPayload()

    try {
      const res = await axios.post(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
        },
        validateStatus: () => true,
      })

      const ms = Math.round(performance.now() - start)
      setElapsed(ms)

      const result = {
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        headers: Object.fromEntries(
          Object.entries(res.headers).filter(([k]) => ['content-type', 'x-request-id'].includes(k))
        ),
      }
      setResponse(result)
      setHistory((prev) => [{ time: new Date().toLocaleTimeString(), status: res.status, url: form.original_url, ms }, ...prev].slice(0, 10))

      if (responseRef.current) {
        responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } catch (err) {
      const ms = Math.round(performance.now() - start)
      setElapsed(ms)
      setResponse({
        status: 0,
        statusText: 'Network Error',
        data: { error: err.message },
      })
    } finally {
      setLoading(false)
    }
  }

  const statusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50'
    if (status >= 400 && status < 500) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const copyResponse = () => {
    if (!response) return
    navigator.clipboard.writeText(JSON.stringify(response.data, null, 2)).then(
      () => toast.success('Copied!'),
      () => toast.error('Failed to copy')
    )
  }

  const copyCurl = () => {
    const payload = buildPayload()
    const curl = `curl -X POST "${endpoint}" \\\n  -H "Content-Type: application/json" \\\n  -H "X-Api-Key: ${apiKey}" \\\n  -d '${JSON.stringify(payload)}'`
    navigator.clipboard.writeText(curl).then(
      () => toast.success('cURL copied!'),
      () => toast.error('Failed to copy')
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">API Playground</h1>
        <p className="text-sm text-gray-500 mt-1">Test the Snip API directly from your browser</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">POST</span>
              <code className="flex-1 text-sm text-gray-700 font-mono bg-gray-50 px-3 py-2 rounded-lg truncate">
                {endpoint}
              </code>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                API Key <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value.trim())}
                placeholder="sk_paste_your_full_api_key_here"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              {keys.length > 0 && (
                <p className="text-xs text-gray-400 mt-1.5">
                  Your active keys: {keys.map((k) => k.key_prefix + '••••').join(', ')}
                </p>
              )}
              {keys.length === 0 && (
                <p className="text-xs text-amber-600 mt-1.5">No active API keys. Create one from the API Keys page.</p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={form.original_url}
                  onChange={(e) => setForm({ ...form, original_url: e.target.value })}
                  placeholder="https://example.com/very-long-url-here"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Custom Slug</label>
                  <input
                    type="text"
                    value={form.custom_slug}
                    onChange={(e) => setForm({ ...form, custom_slug: e.target.value.replace(/[^a-zA-Z0-9\-_]/g, '') })}
                    placeholder="my-link"
                    maxLength={20}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="My Link"
                    maxLength={255}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Subdomain</label>
                  <input
                    type="text"
                    value={form.subdomain}
                    onChange={(e) => setForm({ ...form, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="blog"
                    maxLength={63}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer text-sm font-medium"
              >
                <HiPlay className="w-4 h-4" />
                {loading ? 'Sending...' : 'Send Request'}
              </button>
              <button
                onClick={copyCurl}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer text-sm"
              >
                <HiClipboardCopy className="w-4 h-4" />
                Copy cURL
              </button>
              {elapsed !== null && (
                <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                  <HiClock className="w-3.5 h-3.5" />
                  {elapsed}ms
                </div>
              )}
            </div>
          </div>

          <div ref={responseRef}>
            {response && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">Response</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColor(response.status)}`}>
                      {response.status} {response.statusText}
                    </span>
                  </div>
                  <button
                    onClick={copyResponse}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    <HiClipboardCopy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Request Preview</p>
            <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
{`POST ${endpoint}
Content-Type: application/json
X-Api-Key: ${apiKey || '<your-api-key>'}

${JSON.stringify(buildPayload(), null, 2)}`}
            </pre>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Fill</h3>
            <div className="space-y-2">
              {[
                { label: 'GitHub', url: 'https://github.com/aliham-za' },
                { label: 'Google', url: 'https://www.google.com/search?q=url+shortener' },
                { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/URL_shortening' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setForm({ ...form, original_url: item.url })}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 transition-colors cursor-pointer truncate"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-gray-400 ml-1.5">{item.url.slice(0, 40)}...</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
              <HiStatusOnline className="w-4 h-4 text-gray-400" />
              History
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No requests yet</p>
            ) : (
              <div className="space-y-1.5">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${statusColor(h.status)}`}>
                        {h.status}
                      </span>
                      <span className="text-gray-500 truncate">{h.url.slice(0, 25)}...</span>
                    </div>
                    <span className="text-gray-400 shrink-0 ml-2">{h.ms}ms</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
            <h3 className="text-xs font-semibold text-indigo-900 mb-2">Parameters</h3>
            <div className="space-y-1.5 text-xs text-indigo-700">
              <p><code className="bg-indigo-100 px-1 rounded">original_url</code> — required</p>
              <p><code className="bg-indigo-100 px-1 rounded">custom_slug</code> — optional custom path</p>
              <p><code className="bg-indigo-100 px-1 rounded">title</code> — optional display name</p>
              <p><code className="bg-indigo-100 px-1 rounded">subdomain</code> — optional, auto-created if new</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
