import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import DebtForm from './components/DebtForm'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import Register from './components/Register'
import Footer from './components/Footer'
import PaymentForm from './components/PaymentForm'
import Payments from './components/Payments'
import AllDebtsList from './components/AllDebtsList'
import PaidDebts from './components/PaidDebts'
import FAQ from './components/FAQ'
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
  editingDebt,
  setEditingDebt,
  paymentDebt,
  setPaymentDebt,
  handleLogout, 
  fetchDebts, 
  handleAddDebt, 
  handleUpdateDebt,
  handleDeleteDebt,
  handleAddPayment,
  notification,
}) {
  const location = useLocation()

  return (
    <div className="App">
      <div className="main-content">
        {notification && (
          <div className={`notification ${
            notification.type === 'debt' ? 'notification-debt' : 
            notification.type === 'logout' ? 'notification-logout' :
            'notification-success'
          }`}>
            {notification.type === 'debt' ? (
              <>📋 {notification.message}</>
            ) : notification.type === 'logout' ? (
              <>⏰ {notification.message}</>
            ) : (
              <>✓ Payment added successfully!</>
            )}
          </div>
        )}
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
              to="/all-debts" 
              className={`nav-item ${location.pathname === '/all-debts' ? 'active' : ''}`}
            >
              All Debts
            </Link>
            <Link 
              to="/payments" 
              className={`nav-item ${location.pathname === '/payments' ? 'active' : ''}`}
            >
              Payments
            </Link>
            <Link 
              to="/paid-debts" 
              className={`nav-item ${location.pathname === '/paid-debts' ? 'active' : ''}`}
            >
              Paid Debts
            </Link>
            <Link 
              to="/faq" 
              className={`nav-item ${location.pathname === '/faq' ? 'active' : ''}`}
            >
              FAQ
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
          <Route path="/all-debts" element={
            <div className="container">
              {loading ? (
                <div className="loading">Loading debts...</div>
              ) : (
                <AllDebtsList debts={debts} onEditDebt={setEditingDebt} onDeleteDebt={handleDeleteDebt} />
              )}
            </div>
          } />
          <Route path="/payments" element={
            <div className="container">
              {loading ? (
                <div className="loading">Loading payments...</div>
              ) : (
                <Payments debts={debts} onMakePayment={setPaymentDebt} />
              )}
            </div>
          } />
          <Route path="/paid-debts" element={
            <div className="container">
              {loading ? (
                <div className="loading">Loading paid debts...</div>
              ) : (
                <PaidDebts debts={debts} />
              )}
            </div>
          } />
          <Route path="/faq" element={
            <div className="container">
              <FAQ />
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

        {/* Modal for updating debt */}
        {editingDebt && (
          <div className="modal-overlay" onClick={() => setEditingDebt(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <DebtForm
                debtToEdit={editingDebt}
                onUpdateDebt={handleUpdateDebt}
                onClose={() => setEditingDebt(null)}
              />
            </div>
          </div>
        )}

        {/* Modal for making payment */}
        {paymentDebt && (
          <div className="modal-overlay" onClick={() => setPaymentDebt(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <PaymentForm 
                debt={paymentDebt} 
                onAddPayment={handleAddPayment} 
                onClose={() => setPaymentDebt(null)}
              />
            </div>
          </div>
        )}
      </div>

      <Footer />
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
  // State for editing a debt
  const [editingDebt, setEditingDebt] = useState(null)
  // State for payment modal
  const [paymentDebt, setPaymentDebt] = useState(null)
  // State for success notification
  const [notification, setNotification] = useState(null)

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

  // Auto-logout functionality when tab/browser is closed for 15 seconds
  useEffect(() => {
    if (!isAuthenticated) return

    let lastActiveTime = Date.now()
    
    const updateLastActiveTime = () => {
      lastActiveTime = Date.now()
      localStorage.setItem('lastActiveTime', lastActiveTime.toString())
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab/browser became hidden - update last active time
        updateLastActiveTime()
      } else {
        // Tab/browser became visible - check if 2 minutes have passed
        const storedLastActiveTime = localStorage.getItem('lastActiveTime')
        const lastActive = storedLastActiveTime ? parseInt(storedLastActiveTime) : lastActiveTime
        const timePassed = Date.now() - lastActive
        
        // If more than 2 minutes (120000ms) have passed, log out
        if (timePassed > 120000) {
          console.log('Auto-logout: Session expired after', Math.round(timePassed/1000), 'seconds')
          handleAutoLogout()
          return
        }
        
        // Update last active time when user returns
        updateLastActiveTime()
      }
    }

    const handleBeforeUnload = () => {
      // Update last active time when page is being unloaded
      updateLastActiveTime()
    }

    const handleFocus = () => {
      // Check session when window gains focus
      const storedLastActiveTime = localStorage.getItem('lastActiveTime')
      if (storedLastActiveTime) {
        const lastActive = parseInt(storedLastActiveTime)
        const timePassed = Date.now() - lastActive
        
        if (timePassed > 120000) {
          console.log('Auto-logout: Session expired after', Math.round(timePassed/1000), 'seconds')
          handleAutoLogout()
          return
        }
      }
      updateLastActiveTime()
    }

    // Initialize last active time
    updateLastActiveTime()

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('focus', handleFocus)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('focus', handleFocus)
    }
  }, [isAuthenticated])

  // Handle login
  const handleLogin = () => {
    setError(null)
    setIsAuthenticated(true)
    // Initialize last active time when user logs in
    localStorage.setItem('lastActiveTime', Date.now().toString())
    fetchDebts()
  }

  // Handle automatic logout with notification
  const handleAutoLogout = () => {
    // Show notification for auto-logout
    setNotification({
      type: 'logout',
      message: 'Session expired due to inactivity for more than 2 minutes'
    })
    
    // Clear the notification after 5 seconds
    setTimeout(() => {
      setNotification(null)
    }, 5000)
    
    // Perform logout
    handleLogout()
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    localStorage.removeItem('userId')
    localStorage.removeItem('lastActiveTime') // Clean up auto-logout timestamp
    setIsAuthenticated(false)
    setDebts([])
    setError(null)
    setLoading(false)
    setEditingDebt(null)
    setPaymentDebt(null)
  }

  // Fetch all debts from the backend API for the logged-in user
  const fetchDebts = async () => {
    try {
      setLoading(true)
      setError(null)
      const userId = localStorage.getItem('userId')
      
      if (!userId) {
        setIsAuthenticated(false)
        setError('Please log in again to load your debts.')
        setLoading(false)
        return
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
      
      // Show success notification
      const formattedAmount = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
      }).format(debtData.totalAmount)
      
      setNotification({ 
        type: 'debt',
        message: `Debt added successfully!` 
      })
      setTimeout(() => setNotification(null), 3500)
    } catch (err) {
      setError(err.message)
      console.error('Error adding debt:', err)
      throw err // Re-throw so the form can handle it
    }
  }

  // Handle updating an existing debt
  const handleUpdateDebt = async (debtId, debtData) => {
    try {
      const userId = localStorage.getItem('userId')

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const payload = { ...debtData, userId }

      const response = await fetch(`/api/debts/${debtId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update debt')
      }

      await fetchDebts()

      setNotification({
        type: 'debt',
        message: `Debt updated successfully!`
      })
      setTimeout(() => setNotification(null), 3500)
    } catch (err) {
      setError(err.message)
      console.error('Error updating debt:', err)
      throw err
    }
  }

  // Handle adding a payment
  const handleAddPayment = async (paymentData) => {
    const userId = localStorage.getItem('userId')

    if (!userId) {
      throw new Error('User not authenticated')
    }

    const payload = { ...paymentData, userId }

    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Failed to log payment')
    }

    await fetchDebts()
    
    // Show success notification
    const formattedAmount = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(paymentData.amount)
    
    setNotification({ amount: formattedAmount })
    setTimeout(() => setNotification(null), 3000)
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
              editingDebt={editingDebt}
              setEditingDebt={setEditingDebt}
              paymentDebt={paymentDebt}
              setPaymentDebt={setPaymentDebt}
              handleLogout={handleLogout}
              fetchDebts={fetchDebts}
              handleAddDebt={handleAddDebt}
              handleUpdateDebt={handleUpdateDebt}
              handleDeleteDebt={handleDeleteDebt}
              handleAddPayment={handleAddPayment}
              notification={notification}
            />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App

