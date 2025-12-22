import { useState } from 'react'

export default function AllDebtsList({ debts, onEditDebt, onDeleteDebt }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debtToDelete, setDebtToDelete] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  if (!debts || debts.length === 0) {
    return (
      <div className="debts-page">
        <div className="debts-page-header">
          <h1>All Debts</h1>
          <p>Track and manage all your debts in one place</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">💳</div>
          <h2>No Debts Yet</h2>
          <p>You haven't added any debts. Start by adding one to get started!</p>
        </div>
      </div>
    )
  }

  // Filter debts based on search term
  const filteredDebts = debts.filter(debt => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      debt.name.toLowerCase().includes(searchLower) ||
      (debt.creditor && debt.creditor.toLowerCase().includes(searchLower)) ||
      (debt.description && debt.description.toLowerCase().includes(searchLower))
    )
  })

  // Sort debts by creation date (newest first) or by name
  const sortedDebts = [...filteredDebts].sort((a, b) => {
    // First sort by completion status (incomplete first)
    const aCompleted = (a.totalPaid || 0) >= a.totalAmount
    const bCompleted = (b.totalPaid || 0) >= b.totalAmount
    
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1
    }
    
    // Then sort by name
    return (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
  })

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
    setDebtToDelete(debt)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (debtToDelete && onDeleteDebt) {
      onDeleteDebt(debtToDelete._id)
    }
    setShowDeleteModal(false)
    setDebtToDelete(null)
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setDebtToDelete(null)
  }

  return (
    <div className="debts-page">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay" onClick={handleCancelDelete}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <div className="delete-modal-icon">⚠️</div>
              <h2>Delete Debt</h2>
            </div>
            <div className="delete-modal-body">
              <p>Are you sure you want to delete <strong>"{debtToDelete?.name}"</strong>?</p>
              <p className="delete-modal-warning">This action cannot be undone and will permanently remove this debt record.</p>
            </div>
            <div className="delete-modal-actions">
              <button className="btn btn-cancel" onClick={handleCancelDelete}>
                Cancel
              </button>
              <button className="btn btn-delete-confirm" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="debts-page-header">
        <h1>All Debts</h1>
        <p>Track and manage all your debts in one place</p>
      </div>

      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search debts by name or creditor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="search-clear-btn"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {filteredDebts.length === 0 && searchTerm ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No debts found</h3>
          <p>No debts match your search for "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="btn btn-secondary"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="debts-grid">
          {sortedDebts.map((debt) => {
            const totalPaidAmount = debt.totalPaid || 0
            const remainingAmount = debt.totalAmount - totalPaidAmount
            const progressPercent = debt.totalAmount
              ? ((totalPaidAmount / debt.totalAmount) * 100)
              : 0
            const interestAccrued = calculateInterestAccrued(debt)

            // Determine progress color class
            let progressColorClass = 'error'
            if (progressPercent >= 80) progressColorClass = 'success'
            else if (progressPercent >= 50) progressColorClass = 'info'
            else if (progressPercent >= 20) progressColorClass = 'warning'

            // Determine status badge
            const getStatusBadge = () => {
              const isPaid = totalPaidAmount >= debt.totalAmount
              const progress = progressPercent / 100
              
              if (isPaid) {
                return { class: 'success', label: 'Paid Off' }
              } else if (progress >= 0.8) {
                return { class: 'info', label: 'Almost Done' }
              } else if (progress >= 0.5) {
                return { class: 'info', label: 'In Progress' }
              } else if (progress > 0) {
                return { class: 'warning', label: 'Started' }
              } else {
                return { class: 'error', label: 'Not Started' }
              }
            }

            const statusBadge = getStatusBadge()

            return (
              <div key={debt._id} className="debt-card">
                <div className="debt-card-header">
                  <div className="debt-title">
                    <h3>{debt.name}</h3>
                    {debt.creditor && <p className="debt-creditor">{debt.creditor}</p>}
                  </div>
                  <div className={`debt-status-badge ${statusBadge.class}`}>
                    {statusBadge.label}
                  </div>
                </div>

                <div className="debt-amounts">
                  <div className="amount-row">
                    <span className="amount-label">Total Amount:</span>
                    <span className="amount-value total">{formatCurrency(debt.totalAmount)}</span>
                  </div>
                  <div className="amount-row">
                    <span className="amount-label">Remaining:</span>
                    <span className="amount-value remaining">{formatCurrency(remainingAmount)}</span>
                  </div>
                  <div className="amount-row">
                    <span className="amount-label">Paid:</span>
                    <span className="amount-value paid">{formatCurrency(totalPaidAmount)}</span>
                  </div>
                </div>

                <div className="debt-progress">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span className="progress-percentage">{progressPercent.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar-simple">
                    <div 
                      className={`progress-fill-simple ${progressColorClass}`}
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="debt-details">
                  <div className="detail-item">
                    <span className="detail-label">Date Started:</span>
                    <span className="detail-value">{formatDate(debt.dateOfLoan)}</span>
                  </div>
                  {debt.interestRate && (
                    <div className="detail-item">
                      <span className="detail-label">Interest Rate:</span>
                      <span className="detail-value">{debt.interestRate}%</span>
                    </div>
                  )}
                  {debt.monthlyPayment && (
                    <div className="detail-item">
                      <span className="detail-label">Monthly Payment:</span>
                      <span className="detail-value">{formatCurrency(debt.monthlyPayment)}</span>
                    </div>
                  )}
                  {interestAccrued > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Interest Accrued:</span>
                      <span className="detail-value" style={{ color: '#FF2C2C', fontWeight: '700' }}>
                        {formatCurrency(interestAccrued)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="debt-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => onEditDebt && onEditDebt(debt)}
                  >
                    Update
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteClick(debt)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
