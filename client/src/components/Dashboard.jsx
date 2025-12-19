import { useMemo } from 'react'

function Dashboard({ debts }) {
  // Calculate total debt amount
  const totalDebt = useMemo(() => {
    return debts.reduce((sum, debt) => sum + debt.totalAmount, 0)
  }, [debts])

  // Calculate total monthly payment commitment
  const totalMonthlyPayment = useMemo(() => {
    return debts
      .filter(debt => debt.monthlyPayment > 0)
      .reduce((sum, debt) => sum + debt.monthlyPayment, 0)
  }, [debts])

  // Calculate estimated debt-free date
  // This is the longest payoff time among all debts
  const estimatedDebtFreeDate = useMemo(() => {
    if (debts.length === 0) return null

    let maxMonths = 0
    debts.forEach(debt => {
      if (debt.monthlyPayment > 0) {
        const months = Math.ceil(debt.totalAmount / debt.monthlyPayment)
        if (months > maxMonths) {
          maxMonths = months
        }
      }
    })

    if (maxMonths === 0) return null

    const today = new Date()
    const debtFreeDate = new Date(today)
    debtFreeDate.setMonth(today.getMonth() + maxMonths)

    return debtFreeDate
  }, [debts])

  // Calculate progress (simple: based on total paid vs total debt)
  // For simplicity, we'll show progress as percentage of debts that could be paid off
  // This is a simplified progress indicator
  const progress = useMemo(() => {
    if (debts.length === 0 || totalDebt === 0) return 0
    
    // Simple progress: assume user has paid some amount
    // For now, we'll show 0% as starting point
    // In a real app, you'd track payments made
    return 0
  }, [debts, totalDebt])

  // Format currency (Philippine Peso)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  // Calculate months until debt-free
  const monthsUntilDebtFree = useMemo(() => {
    if (!estimatedDebtFreeDate) return 0
    const today = new Date()
    const months = Math.ceil((estimatedDebtFreeDate - today) / (1000 * 60 * 60 * 24 * 30))
    return months
  }, [estimatedDebtFreeDate])

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        {/* 1. Total Debt - Primary Focus */}
        <div className="dashboard-card primary">
          <div className="dashboard-label">Total Debt</div>
          <div className="dashboard-value primary-value">
            {formatCurrency(totalDebt)}
          </div>
        </div>

        {/* 2. Monthly Payment Commitment */}
        <div className="dashboard-card">
          <div className="dashboard-label">Monthly Payment Commitment</div>
          <div className="dashboard-value">
            {formatCurrency(totalMonthlyPayment)}
          </div>
        </div>

        {/* 3. Estimated Debt-Free Date */}
        <div className="dashboard-card">
          <div className="dashboard-label">Estimated Debt-Free Date</div>
          <div className="dashboard-value">
            {estimatedDebtFreeDate ? formatDate(estimatedDebtFreeDate) : 'N/A'}
          </div>
          {estimatedDebtFreeDate && (
            <div className="dashboard-subtext">
              {monthsUntilDebtFree} {monthsUntilDebtFree === 1 ? 'month' : 'months'} remaining
            </div>
          )}
        </div>

        {/* 4. Progress Indicator */}
        <div className="dashboard-card">
          <div className="dashboard-label">Progress</div>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-text">{progress}%</div>
          </div>
          <div className="dashboard-subtext">
            {progress === 0 ? 'Start your journey to debt freedom!' : 'Keep going!'}
          </div>
        </div>

        {/* 5. Total Debts */}
        <div className="dashboard-card">
          <div className="dashboard-label">Total Debts</div>
          <div className="dashboard-value">
            {debts.length}
          </div>
          <div className="dashboard-subtext">
            {debts.length === 1 ? 'debt' : 'debts'} to track
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

