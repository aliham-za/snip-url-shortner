import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function BrowserPieChart({ data, osData }) {
  const hasBrowser = data && data.length > 0
  const hasOs = osData && osData.length > 0

  if (!hasBrowser && !hasOs) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
        No browser/OS data yet
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="grid grid-cols-1 gap-6">
        {hasBrowser && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Browsers</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) => `${name || 'Unknown'} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {data.map((entry, i) => (
                    <Cell key={entry.name || i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {hasOs && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Systems</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={osData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) => `${name || 'Unknown'} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {osData.map((entry, i) => (
                    <Cell key={entry.name || i} fill={COLORS[(i + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
