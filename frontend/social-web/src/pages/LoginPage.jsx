import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'
function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { loginUser } = useAuth()
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const token = await login(username, password)
      loginUser(token)
      navigate('/')
    } catch (err) {
      const message = err.response?.data || 'Invalid username or password'
      setError(typeof message === 'string' ? message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }
  return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-1/4 -left-24 w-72 h-72 bg-pink-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-24 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl" />
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-white/60 p-8 relative">
          <div className="flex flex-col items-center mb-1">
            <svg viewBox="0 0 100 100" className="w-14 h-14 mb-2">
              <defs>
                <linearGradient id="loginLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#7e22ce" />
                </linearGradient>
              </defs>
              <path
                  d="M28 12 H72 C72 12 72 28 50 50 C72 72 72 88 72 88 H28 C28 88 28 72 50 50 C28 28 28 12 28 12 Z"
                  fill="none"
                  stroke="url(#loginLogoGradient)"
                  strokeWidth="6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
              />
              <path
                  d="M50 50 L36 68 H64 Z"
                  fill="url(#loginLogoGradient)"
                  opacity="0.85"
              />
            </svg>
            <h1 className="text-3xl font-semibold text-ink-900 text-center font-display">
              Ora
            </h1>
          </div>
          <p className="text-sm text-ink-400 mb-6 text-center">
            Welcome back, log in to continue
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border border-sage-200 rounded-xl px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-sunset-400 focus:border-transparent transition-shadow"
                required
            />
            <div className="relative">
              <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border border-sage-200 rounded-xl px-4 py-2.5 pr-14 w-full text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-sunset-400 focus:border-transparent transition-shadow"
                  required
              />
              <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-sunset-600 text-xs font-medium transition-colors"
                  tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {error && <p className="text-clay-500 text-sm">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white rounded-xl px-4 py-2.5 font-medium text-sm shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 mt-1"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
          <p className="text-sm text-ink-400 mt-5 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-sunset-600 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
  )
}
export default LoginPage