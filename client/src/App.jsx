import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import DebtForm from './components/DebtForm'
import DebtList from './components/DebtList'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import Register from './components/Register'
import './App.css'

function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppContent({ 
  debts, 
  loading, 
  error, 
  isModalOpen, 
  setIsModalOpen, 
  handleLogout, 
  fetchDebts, 
  handleAddDebt, 
  handleDeleteDebt 
}) {
  const location = useLocation()

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>💰 Debt Tracker</h1>
            <p>Manage and track your debts</p>
            <p className="username">Logged in as: {localStorage.getItem('username')}</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary btn-add-debt"
              onClick={() => setIsModalOpen(true)}
            >
              + Add Debt
            </button>
            <button 
              className="btn btn-secondary btn-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="nav-bar">
        <div className="nav-content">
          <Link 
            to="/dashboard" 
            className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/debts" 
            className={`nav-item ${location.pathname === '/debts' ? 'active' : ''}`}
          >
            All Debts
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/dashboard" element={
          <div className="container">
            {error && (
              <div className="error">
                <strong>Error:</strong> {error}
              </div>
            )}

            {loading ? (
              <div className="loading">Loading debts...</div>
            ) : (
              <Dashboard debts={debts} />
            )}
          </div>
        } />
        <Route path="/debts" element={
          <div className="container">
            {error && (
              <div className="error">
                <strong>Error:</strong> {error}
              </div>
            )}

            {loading ? (
              <div className="loading">Loading debts...</div>
            ) : (
              <DebtList debts={debts} onDeleteDebt={handleDeleteDebt} />
            )}
          </div>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Modal for adding debt */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <DebtForm 
              onAddDebt={handleAddDebt} 
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  // State to track authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  // State to store all debts
  const [debts, setDebts] = useState([])
  // State to track loading status
  const [loading, setLoading] = useState(true)
  // State to track errors
  const [error, setError] = useState(null)
  // State to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Check if user is logged in on mount
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
    setIsAuthenticated(loggedIn)
    if (loggedIn) {
      fetchDebts()
    } else {
      setLoading(false)
    }
  }, [])

  // Handle login
  const handleLogin = () => {
    setIsAuthenticated(true)
    fetchDebts()
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('userId')
    setIsAuthenticated(false)
    setDebts([])
  }

  // Fetch all debts from the backend API for the logged-in user
  const fetchDebts = async () => {
    try {
      setLoading(true)
      setError(null)
      const userId = localStorage.getItem('userId')
      
      if (!userId) {
        throw new Error('User not authenticated')
      }
      
      // Debug: Log the userId being used
      console.log('Fetching debts for userId:', userId)
      
      const response = await fetch(`/api/debts?userId=${encodeURIComponent(userId)}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch debts')
      }
      
      const data = await response.json()
      console.log('Fetched debts:', data.length, 'debts for user:', userId)
      setDebts(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching debts:', err)
    } finally {
      setLoading(false)
    }
  }


  // Handle adding a new debt
  const handleAddDebt = async (debtData) => {
    try {
      const userId = localStorage.getItem('userId')
      
      if (!userId) {
        throw new Error('User not authenticated')
      }
      
      // Add userId to the debt data
      const debtWithUser = {
        ...debtData,
        userId
      }
      
      const response = await fetch('/api/debts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(debtWithUser),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add debt')
      }

      // Refresh the debt list after adding
      await fetchDebts()
    } catch (err) {
      setError(err.message)
      console.error('Error adding debt:', err)
      throw err // Re-throw so the form can handle it
    }
  }

  // Handle deleting a debt
  const handleDeleteDebt = async (id) => {
    try {
      const userId = localStorage.getItem('userId')
      
      if (!userId) {
        throw new Error('User not authenticated')
      }
      
      const response = await fetch(`/api/debts/${id}?userId=${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete debt')
      }

      // Refresh the debt list after deleting
      await fetchDebts()
    } catch (err) {
      setError(err.message)
      console.error('Error deleting debt:', err)
    }
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : 
          <div className="login-container">
            <Login onLogin={handleLogin} />
          </div>
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : 
          <div className="login-container">
            <Register onRegister={handleLogin} />
          </div>
        } />
        <Route path="/*" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AppContent 
              debts={debts}
              loading={loading}
              error={error}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              handleLogout={handleLogout}
              fetchDebts={fetchDebts}
              handleAddDebt={handleAddDebt}
              handleDeleteDebt={handleDeleteDebt}
            />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App

