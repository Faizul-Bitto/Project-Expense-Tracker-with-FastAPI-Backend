import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { authApi } from '../../api/auth.api'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.resetPassword({ email, password })
      navigate('/login', { replace: true, state: { message: 'Password reset successfully. Please login.' } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Password reset failed.')
    } finally {
      setLoading(false)
    }
  }

  if (!email) {
    navigate('/forgot-password', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="mt-2 text-gray-600">Enter your new password</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-5">
          {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading || password.length < 6}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <p className="text-center text-sm text-gray-600">
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Back to login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}