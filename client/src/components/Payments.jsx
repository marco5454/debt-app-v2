import { useState, useEffect } from 'react'

export default function Payments({ debts, onMakePayment }) {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('userId')
      
      if (!userId) return

      const response = await fetch(`/api/payments?userId=${encodeURIComponent(userId)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch payments')
      }

      const data = await response.json()
      setPayments(data)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDebtName = (debtId) => {
    const debt = debts.find(d => d._id === debtId)
    return debt ? debt.name : 'Unknown Debt'
  }

  const getActiveDebts = () => {
    return debts.filter(debt => {
      const remaining = debt.totalAmount - (debt.totalPaid || 0)
      return remaining > 0
    })
  }

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true
    const debt = debts.find(d => d._id === payment.debtId)
    return debt && debt._id === filter
  })

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    let aValue, bValue

    if (sortBy === 'date') {
      aValue = new Date(a.date)
      bValue = new Date(b.date)
    } else if (sortBy === 'amount') {
      aValue = a.amount
      bValue = b.amount
    } else if (sortBy === 'debt') {
      aValue = getDebtName(a.debtId).toLowerCase()
      bValue = getDebtName(b.debtId).toLowerCase()
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const activeDebts = getActiveDebts()
  
  // Calculate additional metrics
  const averagePayment = payments.length > 0 ? totalPayments / payments.length : 0
  const totalDebtAmount = debts.reduce((sum, debt) => sum + debt.totalAmount, 0)
  const totalRemainingDebt = debts.reduce((sum, debt) => sum + (debt.totalAmount - (debt.totalPaid || 0)), 0)
  
  // Get this month's payments
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const thisMonthPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.date)
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
  })
  const thisMonthTotal = thisMonthPayments.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <div className="payments-container">
      <div className="payments-header">
        <h2>Payments & Debt Management</h2>
        <div className="payments-summary">
          <div className="summary-item">
            <span className="summary-label">Total Payments Made</span>
            <span className="summary-value">{formatCurrency(totalPayments)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Payments</span>
            <span className="summary-value">{payments.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Average Payment</span>
            <span className="summary-value">{formatCurrency(averagePayment)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">This Month</span>
            <span className="summary-value">{formatCurrency(thisMonthTotal)}</span>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side */}
      <div className="payments-main-content">
        {/* Quick Pay Section */}
        {activeDebts.length > 0 && (
          <div className="quick-pay-section">
            <h3>Quick Pay</h3>
            <div className="active-debts-grid">
              {activeDebts.map(debt => {
                const remaining = debt.totalAmount - (debt.totalPaid || 0)
                const progress = ((debt.totalPaid || 0) / debt.totalAmount * 100).toFixed(1)
                
                return (
                  <div key={debt._id} className="debt-pay-card">
                    <div className="debt-pay-info">
                      <div className="debt-name-with-progress">
                        <h4>{debt.name}</h4>
                        <span className="debt-progress">{progress}% paid</span>
                      </div>
                      <div className="debt-pay-details">
                        <div className="debt-pay-amount">
                          <span>Remaining: {formatCurrency(remaining)}</span>
                        </div>
                        <div className="debt-pay-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-pay"
                      onClick={() => onMakePayment(debt)}
                    >
                      Pay Now
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Simple Payment History */}
        <div className="simple-payment-history">
          <h3>Recent Payments</h3>
          {loading ? (
            <div className="loading">Loading payments...</div>
          ) : sortedPayments.length === 0 ? (
            <div className="empty-state">
              <p>No payments made yet</p>
            </div>
          ) : (
            <div className="payment-list">
              {sortedPayments.slice(0, 10).map((payment) => (
                <div key={payment._id} className="payment-item-simple">
                  <div className="payment-info">
                    <div className="payment-debt">{getDebtName(payment.debtId)}</div>
                    <div className="payment-date">{formatDate(payment.date)}</div>
                  </div>
                  <div className="payment-amount-simple">+{formatCurrency(payment.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}