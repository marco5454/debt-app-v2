import { useState } from 'react'

export default function PaidDebts({ debts }) {
  const [sortBy, setSortBy] = useState('paidDate')
  const [sortOrder, setSortOrder] = useState('desc')

  // Filter only fully paid debts
  const paidDebts = debts ? debts.filter(debt => (debt.totalPaid || 0) >= debt.totalAmount) : []

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

  // Calculate additional statistics
  const totalCleared = paidDebts.reduce((sum, debt) => sum + debt.totalAmount, 0)
  const totalPaid = paidDebts.reduce((sum, debt) => sum + (debt.totalPaid || 0), 0)
  const totalOverpaid = paidDebts.reduce((sum, debt) => sum + Math.max((debt.totalPaid || 0) - debt.totalAmount, 0), 0)
  const averageDebtSize = paidDebts.length > 0 ? totalCleared / paidDebts.length : 0
  
  // Calculate average time to pay
  const debtsWithTime = paidDebts.filter(debt => debt.dateOfLoan)
  const avgTimeInDays = debtsWithTime.length > 0 ? 
    debtsWithTime.reduce((sum, debt) => {
      const startDate = new Date(debt.dateOfLoan)
      const endDate = debt.lastPaymentDate ? new Date(debt.lastPaymentDate) : new Date()
      return sum + Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24))
    }, 0) / debtsWithTime.length : 0
  
  const formatAvgTime = (days) => {
    if (days < 30) return `${Math.round(days)} days`
    if (days < 365) return `${Math.round(days / 30)} months`
    return `${Math.round(days / 365 * 10) / 10} years`
  }

  return (
    <div className="paid-debts-container">
      <div className="paid-header">
        <h2>🎉 Paid Debts</h2>
        <p>Congratulations! You've successfully paid off {paidDebts.length} debt{paidDebts.length > 1 ? 's' : ''}</p>
        <div className="paid-stats">
          <div className="paid-stat">
            <span className="stat-value">{formatCurrency(totalCleared)}</span>
            <span className="stat-label">Total Debt Cleared</span>
          </div>
          <div className="paid-stat">
            <span className="stat-value">{formatCurrency(totalPaid)}</span>
            <span className="stat-label">Total Amount Paid</span>
          </div>
          <div className="paid-stat">
            <span className="stat-value">{paidDebts.length}</span>
            <span className="stat-label">Debts Completed</span>
          </div>
          <div className="paid-stat">
            <span className="stat-value">{formatCurrency(averageDebtSize)}</span>
            <span className="stat-label">Average Debt Size</span>
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="paid-main-content">
        {/* Achievement Stats Column */}
        <div className="achievement-stats-section">
          <h3>Achievement Stats</h3>
          <div className="achievement-grid">
            <div className="achievement-item total-cleared">
              <div className="stat-label">Debt Eliminated</div>
              <div className="stat-value">{formatCurrency(totalCleared)}</div>
            </div>
            <div className="achievement-item total-paid">
              <div className="stat-label">Total Payments Made</div>
              <div className="stat-value">{formatCurrency(totalPaid)}</div>
            </div>
            <div className="achievement-item average-time">
              <div className="stat-label">Avg. Payoff Time</div>
              <div className="stat-value">{formatAvgTime(avgTimeInDays)}</div>
            </div>
            {totalOverpaid > 0 && (
              <div className="achievement-item overpaid">
                <div className="stat-label">Total Overpaid</div>
                <div className="stat-value">{formatCurrency(totalOverpaid)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Paid Debts List Column */}
        <div className="paid-debts-list-section">
          <h3>Completed Debts</h3>
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

        {/* Congratulations Column */}
        <div className="congratulations-section">
          <div className="congrats-card">
            <h3>🌟 Outstanding Achievement!</h3>
            <p>
              You've successfully eliminated <strong>{formatCurrency(totalCleared)}</strong> 
              in debt! This is a significant step toward financial freedom.
            </p>
            {totalOverpaid > 0 && (
              <p>
                <em>Note: You've overpaid by {formatCurrency(totalOverpaid)} total across all debts.</em>
              </p>
            )}
            <div className="motivational-quotes">
              <div className="quote">"Financial peace isn't the acquisition of stuff. It's learning to live on less than you make, so you can give money back and have money to invest. You can't win until you do this." - Dave Ramsey</div>
              <div className="quote">"Every payment you made brought you closer to this moment of freedom. Keep up the great work!"</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}