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
      
      console.log('Attempting login with:', { username: formData.username.trim() })
      console.log('Making request to: /api/users/login')
      
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

      console.log('Response status:', response.status)
      console.log('Response headers:', [...response.headers.entries()])

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type')
      let data = {}
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
          console.log('Response data:', data)
        } catch (parseError) {
          console.error('JSON parse error:', parseError)
          throw new Error('Invalid response from server. Please try again.')
        }
      } else {
        // If not JSON, get text response
        const text = await response.text()
        console.error('Non-JSON response:', text)
        throw new Error(text || 'Login failed. Please try again.')
      }

      if (!response.ok) {
        console.error('Login failed with status:', response.status, 'Message:', data.message || data.error)
        throw new Error(data.message || data.error || 'Login failed')
      }

      // Login successful
      console.log('Login successful, user data:', data.user)
      // Store login state in localStorage
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', data.user.username)
      localStorage.setItem('userId', data.user._id)
      localStorage.setItem('lastActiveTime', Date.now().toString()) // Initialize auto-logout timestamp
      
      // Call the onLogin callback
      onLogin()
    } catch (err) {
      console.error('Login error details:', err)
      // Handle network errors
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Server not reachable. Please ensure the server is running on http://localhost:5001')
      } else {
        setError(err.message || 'Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand">
            <div className="brand-icon">💰</div>
            <h1 className="brand-title">Debt Tracker</h1>
          </div>
          <p className="login-subtitle">Sign in to manage your debts</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <div className="error-icon">⚠️</div>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="login-button" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <button 
              type="button" 
              className="register-link"
              onClick={() => navigate('/register')}
            >
              Create one
            </button>
          </p>
          <div className="debug-info">
            <details>
              <summary style={{ cursor: 'pointer', color: '#666', fontSize: '12px', marginTop: '10px' }}>
                Troubleshooting
              </summary>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '5px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                <p><strong>If login fails:</strong></p>
                <p>1. Make sure the server is running on port 5001</p>
                <p>2. Check browser console (F12) for detailed error logs</p>
                <p>3. Try registering a new user first</p>
                <p>4. Verify MongoDB connection in server logs</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

