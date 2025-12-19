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
        {/* Payment History Section */}
        <div className="payment-history-section">
        <div className="payment-history-header">
          <h3>Payment History</h3>
          <div className="payment-filters">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Debts</option>
              {debts.map(debt => (
                <option key={debt._id} value={debt._id}>{debt.name}</option>
              ))}
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}
              className="sort-select"
            >
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="debt-asc">Debt Name A-Z</option>
              <option value="debt-desc">Debt Name Z-A</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading payment history...</div>
        ) : sortedPayments.length === 0 ? (
          <div className="empty-payments">
            <div className="empty-icon">💳</div>
            <h4>No Payments Yet</h4>
            <p>Start making payments to see your payment history here.</p>
          </div>
        ) : (
          <div className="payments-table-wrapper">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Debt</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {sortedPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{formatDate(payment.date)}</td>
                    <td className="debt-name">{getDebtName(payment.debtId)}</td>
                    <td className="payment-amount">{formatCurrency(payment.amount)}</td>
                    <td className="payment-method">{payment.method || 'Cash'}</td>
                    <td className="payment-note">{payment.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>

        {/* Quick Pay Section - Right Side */}
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
      </div>
    </div>
  )
}