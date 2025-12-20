import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Simple validation
    if (!formData.username.trim()) {
      setError('Username is required')
      return
    }

    if (!formData.password) {
      setError('Password is required')
      return
    }

    try {
      setIsLoading(true)
      
      // Call login API
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password
        }),
      })

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type')
      let data = {}
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch (parseError) {
          console.error('JSON parse error:', parseError)
          throw new Error('Invalid response from server. Please try again.')
        }
      } else {
        // If not JSON, get text response
        const text = await response.text()
        throw new Error(text || 'Login failed. Please try again.')
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed')
      }

      // Login successful
      // Store login state in localStorage
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', data.user.username)
      localStorage.setItem('userId', data.user._id)
      localStorage.setItem('lastActiveTime', Date.now().toString()) // Initialize auto-logout timestamp
      
      // Call the onLogin callback
      onLogin()
    } catch (err) {
      // Handle network errors
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError(err.message || 'Login failed. Please try again.')
      }
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-card">
        <div className="login-header">
          <h1>💰 Debt Tracker</h1>
          <p>Sign in to manage your debts</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-login"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <button 
              type="button" 
              className="link-button"
              onClick={() => navigate('/register')}
            >
              Register
            </button>
          </p>
        </div>
      </div>
  )
}

export default Login

