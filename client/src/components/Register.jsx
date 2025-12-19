import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Register({ onRegister }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    gender: ''
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

    // Validation
    if (!formData.username.trim()) {
      setError('Username is required')
      return
    }

    if (formData.username.trim().length < 2) {
      setError('Username must be at least 2 characters')
      return
    }

    if (!formData.password) {
      setError('Password is required')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!formData.gender) {
      setError('Gender is required')
      return
    }

    try {
      setIsLoading(true)
      
      // Call registration API
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
        throw new Error(text || 'Registration failed. Please try again.')
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Registration failed')
      }

      // Registration successful
      // Show success message and switch to login
      alert('Registration successful! Please login with your credentials.')
      onSwitchToLogin()
    } catch (err) {
      // Handle network errors
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError(err.message || 'Registration failed. Please try again.')
      }
      console.error('Registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-card">
      <div className="login-header">
        <h1>💰 Debt Tracker</h1>
        <p>Create your account</p>
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
            minLength={2}
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
            placeholder="Enter your password (min 6 characters)"
            required
            autoComplete="new-password"
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="form-select"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-login"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div className="login-footer">
        <p>
          Already have an account?{' '}
          <button 
            type="button" 
            className="link-button"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}

export default Register

