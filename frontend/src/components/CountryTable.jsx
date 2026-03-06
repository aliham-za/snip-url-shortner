export default function CountryTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
        No country data yet
      </div>
    )
  }

  const max = data.reduce((m, d) => Math.max(m, d.count || 0), 1)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-36 truncate">{item.name}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 w-12 text-right">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
