import { useMemo, useState } from 'react'

function DebtList({ debts, onDeleteDebt, payments = [], onOpenPayment }) {
  const [expandedDebt, setExpandedDebt] = useState(null)
  // Calculate payoff duration in months
  // Formula: totalAmount / monthlyPayment
  const calculatePayoffMonths = (totalAmount, monthlyPayment) => {
    if (monthlyPayment <= 0) return 0
    return Math.ceil(totalAmount / monthlyPayment)
  }

  // Calculate priority score for each debt
  // Priority is based on: highest balance, longest payoff time, highest monthly payment
  const calculatePriority = (debt, allDebts) => {
    const maxBalance = Math.max(...allDebts.map(d => d.totalAmount))
    const maxPayoffMonths = Math.max(...allDebts.map(d => calculatePayoffMonths(d.totalAmount, d.monthlyPayment)))
    const maxMonthlyPayment = Math.max(...allDebts.map(d => d.monthlyPayment))

    // Normalize each factor (0-1 scale)
    const balanceScore = maxBalance > 0 ? debt.totalAmount / maxBalance : 0
    const payoffScore = maxPayoffMonths > 0 ? calculatePayoffMonths(debt.totalAmount, debt.monthlyPayment) / maxPayoffMonths : 0
    const paymentScore = maxMonthlyPayment > 0 ? debt.monthlyPayment / maxMonthlyPayment : 0

    // Weighted priority score (balance: 40%, payoff time: 35%, monthly payment: 25%)
    const priorityScore = (balanceScore * 0.4) + (payoffScore * 0.35) + (paymentScore * 0.25)
    
    return priorityScore
  }

  // Get top 5 priority debts
  const topPriorityDebts = useMemo(() => {
    if (debts.length === 0) return []
    
    // Calculate priority for each debt and sort
    const debtsWithPriority = debts.map(debt => ({
      ...debt,
      priorityScore: calculatePriority(debt, debts)
    }))
    
    // Sort by priority score (highest first) and take top 5
    return debtsWithPriority
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 5)
  }, [debts])

  // Format months into years and months
  const formatPayoffDuration = (months) => {
    if (months === 0) return 'N/A'
    
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12

    if (years === 0) {
      return `${months} ${months === 1 ? 'month' : 'months'}`
    } else if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`
    } else {
      return `${years} ${years === 1 ? 'year' : 'years'} and ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`
    }
  }

  // Format currency (Philippine Peso)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  // Format percentage
  const formatPercentage = (rate) => {
    return `${rate.toFixed(2)}%`
  }

  // Get priority reason for display
  const getPriorityReason = (debt, allDebts) => {
    const reasons = []
    const maxBalance = Math.max(...allDebts.map(d => d.totalAmount))
    const maxPayoffMonths = Math.max(...allDebts.map(d => calculatePayoffMonths(d.totalAmount, d.monthlyPayment)))
    const maxMonthlyPayment = Math.max(...allDebts.map(d => d.monthlyPayment))
    
    const payoffMonths = calculatePayoffMonths(debt.totalAmount, debt.monthlyPayment)
    
    if (debt.totalAmount === maxBalance) {
      reasons.push('Highest Balance')
    }
    if (payoffMonths === maxPayoffMonths) {
      reasons.push('Longest Payoff Time')
    }
    if (debt.monthlyPayment === maxMonthlyPayment) {
      reasons.push('Highest Monthly Payment')
    }
    
    return reasons.length > 0 ? reasons.join(' • ') : 'High Priority'
  }

  return (
    <div className="debt-list">
      <div className="debt-list-header">
        <h2>All Debts</h2>
        {debts.length > 5 && (
          <p className="debt-list-subtitle">
            Showing top 5 priority debts out of {debts.length} total debts
            {debts.some(debt => debt.monthlyPayment === 0) && ' (some debts have no monthly payment specified)'}
          </p>
        )}
      </div>

      {topPriorityDebts.length > 0 ? (
        <div className="debt-table-container">
          <table className="debt-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Debt Name</th>
                <th>Total</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {topPriorityDebts.map((debt, index) => {
                const payoffMonths = calculatePayoffMonths(debt.totalAmount, debt.monthlyPayment)
                const payoffDuration = formatPayoffDuration(payoffMonths)
                const priorityReason = getPriorityReason(debt, debts)
                const debtPayments = payments.filter(p => p.debtId === debt._id)
                const isExpanded = expandedDebt === debt._id

                return (
                  <>
                    <tr key={debt._id} className="debt-row">
                      <td className="priority-col">
                        <span className="priority-num">#{index + 1}</span>
                      </td>
                      <td className="debt-name-col">
                        <strong>{debt.name}</strong>
                      </td>
                      <td className="amount-col">
                        <strong style={{ color: '#e74c3c', fontSize: '1rem' }}>
                          {formatCurrency(debt.totalAmount)}
                        </strong>
                      </td>
                      <td className="actions-col">
                        <div className="table-actions">
                          <button
                            className="btn-icon"
                            onClick={() => setExpandedDebt(isExpanded ? null : debt._id)}
                            title={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? '▼' : '▶'}
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onOpenPayment && onOpenPayment(debt)}
                            title="Log Payment"
                          >
                            Pay
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              if (window.confirm(`Delete "${debt.name}"?`)) {
                                onDeleteDebt(debt._id)
                              }
                            }}
                            title="Delete Debt"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="debt-expanded-row">
                        <td colSpan="4">
                          <div className="debt-expanded-content">
                            <div className="expanded-grid">
                              <div className="expanded-item">
                                <span className="expanded-label">Creditor</span>
                                <span className="expanded-value">{debt.creditor || 'N/A'}</span>
                              </div>
                              <div className="expanded-item">
                                <span className="expanded-label">Remaining Balance</span>
                                <span className="expanded-value" style={{ color: '#c0392b' }}>
                                  {formatCurrency(Math.max(debt.remainingAmount || debt.totalAmount, 0))}
                                </span>
                              </div>
                              <div className="expanded-item">
                                <span className="expanded-label">Interest Rate</span>
                                <span className="expanded-value">{debt.interestRate > 0 ? `${debt.interestRate}%` : 'None'}</span>
                              </div>
                              <div className="expanded-item">
                                <span className="expanded-label">Monthly Payment</span>
                                <span className="expanded-value">
                                  {debt.monthlyPayment > 0 ? formatCurrency(debt.monthlyPayment) : 'N/A'}
                                </span>
                              </div>
                              <div className="expanded-item">
                                <span className="expanded-label">Loan Date</span>
                                <span className="expanded-value">
                                  {debt.dateOfLoan ? new Date(debt.dateOfLoan).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                </span>
                              </div>
                              <div className="expanded-item">
                                <span className="expanded-label">Payoff Time</span>
                                <span className="expanded-value">
                                  {debt.monthlyPayment > 0 ? (payoffMonths > 12 ? `${Math.floor(payoffMonths / 12)}y ${payoffMonths % 12}m` : `${payoffMonths}m`) : 'N/A'}
                                </span>
                              </div>
                              {debt.lastPaymentDate && (
                                <div className="expanded-item">
                                  <span className="expanded-label">Last Payment</span>
                                  <span className="expanded-value">
                                    {formatCurrency(debt.lastPaymentAmount || 0)} on {new Date(debt.lastPaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                              )}
                              {typeof debt.totalPaid === 'number' && (
                                <div className="expanded-item">
                                  <span className="expanded-label">Total Paid</span>
                                  <span className="expanded-value" style={{ color: '#27ae60' }}>
                                    {formatCurrency(debt.totalPaid)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {debt.description && (
                              <div className="expanded-section">
                                <strong>Description:</strong>
                                <p>{debt.description}</p>
                              </div>
                            )}

                            {debtPayments.length > 0 && (
                              <div className="expanded-section">
                                <strong>Recent Payments ({debtPayments.length})</strong>
                                <ul className="expanded-payments">
                                  {debtPayments.slice(0, 5).map((payment) => (
                                    <li key={payment._id || payment.createdAt}>
                                      {formatCurrency(payment.amount)} - {payment.method} - {new Date(payment.date || payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                      {payment.note && <span className="payment-note-inline"> ({payment.note})</span>}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>No debts added yet. Click the "Add Debt" button to get started!</p>
        </div>
      )}
      
      {debts.length > 5 && (
        <div className="debt-list-footer">
          <p>You have {debts.length - 5} more debt{debts.length - 5 === 1 ? '' : 's'} not shown in priority list.</p>
        </div>
      )}
    </div>
  )
}

export default DebtList

