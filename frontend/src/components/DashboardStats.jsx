import { HiLink, HiCursorClick, HiTrendingUp } from 'react-icons/hi'

const stats = [
  { key: 'total_links', label: 'Total Links', icon: HiLink, color: 'bg-blue-50 text-blue-600' },
  { key: 'total_clicks', label: 'Total Clicks', icon: HiCursorClick, color: 'bg-green-50 text-green-600' },
  { key: 'clicks_today', label: 'Clicks Today', icon: HiTrendingUp, color: 'bg-purple-50 text-purple-600' },
]

export default function DashboardStats({ data }) {
  if (!data) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map(({ key, label, icon: Icon, color }) => (
        <div key={key} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{data[key]?.toLocaleString() || 0}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
