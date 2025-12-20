import { useState } from 'react'

export default function PaidDebts({ debts }) {
  const [sortBy, setSortBy] = useState('paidDate')
  const [sortOrder, setSortOrder] = useState('desc')

  // Filter only fully paid debts
  const paidDebts = debts ? debts.filter(debt => (debt.totalPaid || 0) >= debt.totalAmount) : []

  if (paidDebts.length === 0) {
    return (
      <div className="paid-debts-container">
        <div className="paid-header">
          <h2>🎉 Paid Debts</h2>
          <p>Debts you've successfully paid off</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Paid Debts Yet</h3>
          <p>Keep making payments on your debts. Once you pay them off completely, they'll appear here!</p>
          <div className="motivational-message">
            <strong>💪 You can do this!</strong>
            <p>Every payment brings you closer to financial freedom.</p>
          </div>
        </div>
      </div>
    )
  }

  // Sort paid debts
  let sortedPaidDebts = [...paidDebts]
  sortedPaidDebts.sort((a, b) => {
    let aValue, bValue
    
    if (sortBy === 'name') {
      aValue = (a.name || '').toLowerCase()
      bValue = (b.name || '').toLowerCase()
    } else if (sortBy === 'amount') {
      aValue = a.totalAmount
      bValue = b.totalAmount
    } else if (sortBy === 'paidDate') {
      aValue = a.lastPaymentDate ? new Date(a.lastPaymentDate) : new Date(a.updatedAt || a.createdAt)
      bValue = b.lastPaymentDate ? new Date(b.lastPaymentDate) : new Date(b.updatedAt || b.createdAt)
    } else if (sortBy === 'totalPaid') {
      aValue = a.totalPaid || 0
      bValue = b.totalPaid || 0
    } else if (sortBy === 'overpaid') {
      aValue = Math.max((a.totalPaid || 0) - a.totalAmount, 0)
      bValue = Math.max((b.totalPaid || 0) - b.totalAmount, 0)
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getSortIndicator = (field) => {
    if (sortBy !== field) return ' ↕'
    return sortOrder === 'asc' ? ' ↑' : ' ↓'
  }

  const calculateTimeToPay = (debt) => {
    if (!debt.dateOfLoan) return '—'
    
    const startDate = new Date(debt.dateOfLoan)
    const endDate = debt.lastPaymentDate ? new Date(debt.lastPaymentDate) : new Date()
    const diffTime = Math.abs(endDate - startDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} days`
    } else if (diffDays < 365) {
      const months = Math.round(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''}`
    } else {
      const years = Math.floor(diffDays / 365)
      const remainingMonths = Math.round((diffDays % 365) / 30)
      if (remainingMonths === 0) {
        return `${years} year${years > 1 ? 's' : ''}`
      }
      return `${years}y ${remainingMonths}m`
    }
  }

  return (
    <div className="paid-debts-container">
      <div className="paid-header">
        <h2>🎉 Paid Debts</h2>
        <p>Congratulations! You've successfully paid off {paidDebts.length} debt{paidDebts.length > 1 ? 's' : ''}</p>
        <div className="paid-stats">
          <div className="paid-stat">
            <span className="stat-value">{formatCurrency(paidDebts.reduce((sum, debt) => sum + debt.totalAmount, 0))}</span>
            <span className="stat-label">Total Debt Cleared</span>
          </div>
          <div className="paid-stat">
            <span className="stat-value">{formatCurrency(paidDebts.reduce((sum, debt) => sum + (debt.totalPaid || 0), 0))}</span>
            <span className="stat-label">Total Amount Paid</span>
          </div>
        </div>
      </div>

      {/* Simple Paid Debts List */}
      <div className="simple-paid-list">
        <h3>Paid Off Debts</h3>
        <div className="paid-debt-list">
          {sortedPaidDebts.map((debt) => {
            const totalPaidAmount = debt.totalPaid || 0
            const completionDate = debt.lastPaymentDate || debt.updatedAt
            
            return (
              <div key={debt._id} className="paid-debt-item">
                <div className="paid-debt-info">
                  <div className="debt-name-paid">{debt.name}</div>
                  <div className="completion-date-paid">{formatDate(completionDate)}</div>
                </div>
                <div className="debt-amount-paid">{formatCurrency(debt.totalAmount)}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="congratulations-section">
        <div className="congrats-card">
          <h3>🌟 Outstanding Achievement!</h3>
          <p>
            You've successfully eliminated <strong>{formatCurrency(paidDebts.reduce((sum, debt) => sum + debt.totalAmount, 0))}</strong> 
            in debt! This is a significant step toward financial freedom.
          </p>
          {paidDebts.reduce((sum, debt) => sum + Math.max((debt.totalPaid || 0) - debt.totalAmount, 0), 0) > 0 && (
            <p>
              <em>Note: You've overpaid by {formatCurrency(paidDebts.reduce((sum, debt) => sum + Math.max((debt.totalPaid || 0) - debt.totalAmount, 0), 0))} total across all debts.</em>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}