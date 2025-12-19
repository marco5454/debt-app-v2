import { useState, useEffect } from 'react'
import DebtForm from './components/DebtForm'
import DebtList from './components/DebtList'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import Register from './components/Register'
import './App.css'

function App() {
  // State to track authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  // State to track if showing login or register
  const [showRegister, setShowRegister] = useState(false)
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

  // Show login or register screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        {showRegister ? (
          <Register 
            onRegister={handleLogin}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <Login 
            onLogin={handleLogin}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>💰 Debt Tracker</h1>
            <p>Manage and track your debts</p>
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

      <div className="container">
        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="loading">Loading debts...</div>
        ) : (
          <>
            <Dashboard debts={debts} />
            <DebtList debts={debts} onDeleteDebt={handleDeleteDebt} />
          </>
        )}
      </div>

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

export default App

