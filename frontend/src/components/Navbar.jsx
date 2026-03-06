import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HiLogout } from 'react-icons/hi'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const { pathname } = useLocation()

  const navLink = (to, label) => {
    const isActive = pathname === to || pathname.startsWith(to + '/')
    return (
      <Link
        to={to}
        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
          isActive
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">✂️</span>
            <span className="text-xl font-bold text-gray-900">Snip</span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {navLink('/dashboard', 'Dashboard')}
                {navLink('/subdomains', 'Subdomains')}
                {navLink('/api-keys', 'API Keys')}
                {navLink('/postman', 'Postman')}
                <span className="text-sm text-gray-400 ml-1">{user?.email}</span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <HiLogout className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">Login</Link>
                <Link to="/signup" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
