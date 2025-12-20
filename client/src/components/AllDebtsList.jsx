import { useState } from 'react'

export default function AllDebtsList({ debts, onEditDebt, onDeleteDebt }) {
  const [sortBy, setSortBy] = useState('dueDate')
  const [sortOrder, setSortOrder] = useState('asc')

  if (!debts || debts.length === 0) {
    return (
      <div className="all-debts-container">
        <div className="empty-state">
          <h2>No Debts Yet</h2>
          <p>You haven't added any debts. Start by adding one to get started!</p>
        </div>
      </div>
    )
  }

  // Sort debts
  let sortedDebts = [...debts]
  sortedDebts.sort((a, b) => {
    let aValue, bValue
    
    if (sortBy === 'name') {
      aValue = (a.name || '').toLowerCase()
      bValue = (b.name || '').toLowerCase()
    } else if (sortBy === 'amount') {
      aValue = a.totalAmount
      bValue = b.totalAmount
    } else if (sortBy === 'remaining') {
      aValue = (a.totalAmount - (a.totalPaid || 0))
      bValue = (b.totalAmount - (b.totalPaid || 0))
    } else if (sortBy === 'progress') {
      aValue = ((a.totalPaid || 0) / a.totalAmount * 100)
      bValue = ((b.totalPaid || 0) / b.totalAmount * 100)
    } else if (sortBy === 'dueDate') {
      aValue = a.dateOfLoan ? new Date(a.dateOfLoan) : new Date(0)
      bValue = b.dateOfLoan ? new Date(b.dateOfLoan) : new Date(0)
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

  const calculateInterestAccrued = (debt) => {
    if (!debt.interestRate || debt.interestRate === 0 || !debt.monthlyPayment || debt.monthlyPayment === 0) {
      return 0
    }

    const loanDate = new Date(debt.dateOfLoan)
    const currentDate = new Date()
    const monthsElapsed = Math.floor((currentDate - loanDate) / (1000 * 60 * 60 * 24 * 30.44)) // Average days per month
    
    // Calculate expected payments made vs actual payments
    const expectedPayments = monthsElapsed * debt.monthlyPayment
    const actualPaid = debt.totalPaid || 0
    const overdueAmount = Math.max(expectedPayments - actualPaid, 0)
    
    // Calculate interest on overdue amount (simple interest for late payments)
    const monthlyInterestRate = debt.interestRate / 100 / 12
    const interestAccrued = overdueAmount * monthlyInterestRate * monthsElapsed
    
    return Math.max(interestAccrued, 0)
  }

  const handleDeleteClick = (debt) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${debt.name}"?\n\nThis action cannot be undone and will permanently remove this debt record.`
    )
    
    if (confirmDelete && onDeleteDebt) {
      onDeleteDebt(debt._id)
    }
  }

  return (
    <div className="all-debts-container">
      <div className="debts-header">
        <h2>All Debts Overview</h2>
      </div>

      <div className="debts-table-wrapper">
        <table className="debts-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('name')}>
                Debt Name{getSortIndicator('name')}
              </th>
              <th onClick={() => toggleSort('amount')}>
                Total Amount{getSortIndicator('amount')}
              </th>
              <th onClick={() => toggleSort('progress')}>
                Progress{getSortIndicator('progress')}
              </th>
              <th onClick={() => toggleSort('remaining')}>
                Remaining{getSortIndicator('remaining')}
              </th>
              <th onClick={() => toggleSort('dueDate')}>
                Due Date{getSortIndicator('dueDate')}
              </th>
              <th>Interest Rate</th>
              <th>Monthly Payment</th>
              <th>Interest Accrued</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedDebts.map((debt) => {
              const totalPaidAmount = debt.totalPaid || 0
              const remainingAmount = debt.totalAmount - totalPaidAmount
              const progressPercent = debt.totalAmount
                ? ((totalPaidAmount / debt.totalAmount) * 100).toFixed(1)
                : '0.0'
              const interestAccrued = calculateInterestAccrued(debt)

              return (
                <tr key={debt._id} className="debt-row">
                  <td className="debt-name" data-label="Debt Name">
                    <div className="debt-name-cell">
                      <span>{debt.name}</span>
                      <div className="debt-actions">
                        <button
                          className="btn btn-secondary btn-update"
                          onClick={() => onEditDebt && onEditDebt(debt)}
                        >
                          Update
                        </button>
                        <button
                          className="btn btn-danger btn-delete"
                          onClick={() => handleDeleteClick(debt)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="debt-amount" data-label="Total Amount">{formatCurrency(debt.totalAmount)}</td>
                  <td data-label="Progress">
                    <div className="progress-bar-container">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{progressPercent}%</span>
                    </div>
                  </td>
                  <td className="debt-amount" data-label="Remaining">{formatCurrency(remainingAmount)}</td>
                  <td data-label="Date">{formatDate(debt.dateOfLoan)}</td>
                  <td data-label="Interest Rate">{debt.interestRate ? `${debt.interestRate}%` : 'N/A'}</td>
                  <td data-label="Monthly Payment">{formatCurrency(debt.monthlyPayment)}</td>
                  <td className={`debt-amount ${interestAccrued > 0 ? 'interest-warning' : ''}`} data-label="Interest Accrued">
                    {formatCurrency(interestAccrued)}
                  </td>
                  <td className="debt-status" data-label="Status">
                    {(() => {
                      const isPaid = (debt.totalPaid || 0) >= debt.totalAmount
                      const progress = debt.totalAmount > 0 ? (debt.totalPaid || 0) / debt.totalAmount : 0
                      
                      if (isPaid) {
                        return (
                          <div className="status-badge paid">
                            <span className="status-icon">✅</span>
                            <span className="status-text">Paid Off</span>
                          </div>
                        )
                      } else if (progress >= 0.8) {
                        return (
                          <div className="status-badge almost-paid">
                            <span className="status-icon">🎯</span>
                            <span className="status-text">Almost Done</span>
                          </div>
                        )
                      } else if (progress >= 0.5) {
                        return (
                          <div className="status-badge in-progress">
                            <span className="status-icon">📈</span>
                            <span className="status-text">In Progress</span>
                          </div>
                        )
                      } else if (progress > 0) {
                        return (
                          <div className="status-badge started">
                            <span className="status-icon">🚀</span>
                            <span className="status-text">Started</span>
                          </div>
                        )
                      } else {
                        return (
                          <div className="status-badge not-started">
                            <span className="status-icon">⏳</span>
                            <span className="status-text">Not Started</span>
                          </div>
                        )
                      }
                    })()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
