import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import ApiKeys from './pages/ApiKeys'
import Subdomains from './pages/Subdomains'
import Postman from './pages/Postman'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" />
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? children : <Navigate to="/dashboard" />
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/links/:id/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/subdomains" element={<ProtectedRoute><Subdomains /></ProtectedRoute>} />
        <Route path="/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
        <Route path="/postman" element={<ProtectedRoute><Postman /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300">404</h1>
              <p className="mt-4 text-gray-500">Page not found</p>
            </div>
          </div>
        } />
      </Routes>
    </div>
  )
}
