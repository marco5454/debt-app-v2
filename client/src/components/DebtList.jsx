import { useMemo } from 'react'

function DebtList({ debts, onDeleteDebt }) {
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
        <h2>Top 5 Priority Debts</h2>
        {debts.length > 5 && (
          <p className="debt-list-subtitle">
            Showing top 5 of {debts.length} debts based on balance, payoff time, and monthly payment
            {debts.some(debt => debt.monthlyPayment === 0) && ' (some debts have no monthly payment specified)'}
          </p>
        )}
      </div>

      {topPriorityDebts.length > 0 ? (
        <>
          {/* List of Priority Debts */}
          {topPriorityDebts.map((debt, index) => {
            const payoffMonths = calculatePayoffMonths(debt.totalAmount, debt.monthlyPayment)
            const payoffDuration = formatPayoffDuration(payoffMonths)
            const priorityReason = getPriorityReason(debt, debts)

            return (
              <div key={debt._id} className="debt-item priority-debt">
                <div className="debt-header">
                  <div className="debt-name-section">
                    <div className="priority-badge">#{index + 1}</div>
                    <div className="debt-name">{debt.name}</div>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${debt.name}"?`)) {
                        onDeleteDebt(debt._id)
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
                
                <div className="priority-reason">
                  {priorityReason}
                </div>

                <div className="debt-details">
                  <div className="detail-item">
                    <span className="detail-label">Total Amount</span>
                    <span className="detail-value">{formatCurrency(debt.totalAmount)}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Monthly Payment</span>
                    <span className="detail-value">
                      {debt.monthlyPayment > 0 ? formatCurrency(debt.monthlyPayment) : 'Not specified'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Interest Rate</span>
                    <span className="detail-value">
                      {debt.interestRate > 0 ? formatPercentage(debt.interestRate) : 'None'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Date of Loan</span>
                    <span className="detail-value">
                      {debt.dateOfLoan ? new Date(debt.dateOfLoan).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>

                  {debt.creditor && (
                    <div className="detail-item">
                      <span className="detail-label">Creditor</span>
                      <span className="detail-value">{debt.creditor}</span>
                    </div>
                  )}
                </div>

                {debt.description && (
                  <div className="debt-description">
                    <h4>Description</h4>
                    <p>{debt.description}</p>
                  </div>
                )}

                {/* Payoff Information */}
                <div className="payoff-info">
                  <h4>Payoff Estimate</h4>
                  {debt.monthlyPayment > 0 ? (
                    <p>
                      <strong>{payoffDuration}</strong> to fully pay off this debt
                      {payoffMonths > 0 && (
                        <span> ({payoffMonths} {payoffMonths === 1 ? 'month' : 'months'})</span>
                      )}
                    </p>
                  ) : (
                    <p>
                      <strong>Cannot calculate payoff time</strong> - Monthly payment not specified
                    </p>
                  )}
                  <p style={{ fontSize: '0.9rem', marginTop: '5px', opacity: 0.8 }}>
                    Note: This is a simple estimate. Interest rates may affect the actual payoff time.
                  </p>
                </div>
              </div>
            )
          })}
        </>
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

