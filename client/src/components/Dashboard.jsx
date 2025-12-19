import { useState, useEffect } from 'react'

export default function Dashboard({ debts }) {
  const [stats, setStats] = useState({
    totalDebt: 0,
    totalPaid: 0,
    remainingDebt: 0,
    totalDebts: 0,
    activeDebts: 0,
    completedDebts: 0,
    averageProgress: 0,
    highestDebt: null,
    overdueDebts: 0,
    totalInterestAccrued: 0
  })

  useEffect(() => {
    if (!debts || debts.length === 0) {
      setStats({
        totalDebt: 0,
        totalPaid: 0,
        remainingDebt: 0,
        totalDebts: 0,
        activeDebts: 0,
        completedDebts: 0,
        averageProgress: 0,
        highestDebt: null,
        overdueDebts: 0,
        totalInterestAccrued: 0
      })
      return
    }

    const totalDebt = debts.reduce((sum, debt) => sum + debt.totalAmount, 0)
    const totalPaid = debts.reduce((sum, debt) => sum + (debt.totalPaid || 0), 0)
    const remainingDebt = totalDebt - totalPaid
    const completedDebts = debts.filter(debt => (debt.totalPaid || 0) >= debt.totalAmount).length
    const activeDebts = debts.length - completedDebts
    const averageProgress = totalDebt > 0 ? (totalPaid / totalDebt * 100) : 0
    const highestDebt = debts.reduce((max, debt) => 
      debt.totalAmount > (max?.totalAmount || 0) ? debt : max, null)
    
    // Calculate overdue debts and interest accrued
    let overdueCount = 0
    let totalInterestAccrued = 0

    debts.forEach(debt => {
      if (debt.monthlyPayment > 0 && debt.interestRate > 0) {
        const loanDate = new Date(debt.dateOfLoan)
        const currentDate = new Date()
        const monthsElapsed = Math.floor((currentDate - loanDate) / (1000 * 60 * 60 * 24 * 30.44))
        const expectedPayments = monthsElapsed * debt.monthlyPayment
        const actualPaid = debt.totalPaid || 0
        
        if (expectedPayments > actualPaid) {
          overdueCount++
          const overdueAmount = expectedPayments - actualPaid
          const monthlyInterestRate = debt.interestRate / 100 / 12
          const interestAccrued = Math.max(overdueAmount * monthlyInterestRate * monthsElapsed, 0)
          totalInterestAccrued += interestAccrued
        }
      }
    })

    setStats({
      totalDebt,
      totalPaid,
      remainingDebt,
      totalDebts: debts.length,
      activeDebts,
      completedDebts,
      averageProgress,
      highestDebt,
      overdueDebts: overdueCount,
      totalInterestAccrued
    })
  }, [debts])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount || 0)
  }

  // Removed payments functionality

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Debt Overview</h1>
        <p>Your complete financial debt summary</p>
      </div>

      {/* Main Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card total-debt">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <h3>Total Debt</h3>
            <div className="stat-value">{formatCurrency(stats.totalDebt)}</div>
          </div>
        </div>

        <div className="stat-card total-paid">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Total Paid</h3>
            <div className="stat-value">{formatCurrency(stats.totalPaid)}</div>
          </div>
        </div>

        <div className="stat-card remaining-debt">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Remaining</h3>
            <div className="stat-value">{formatCurrency(stats.remainingDebt)}</div>
          </div>
        </div>

        <div className="stat-card progress">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Progress</h3>
            <div className="stat-value">{stats.averageProgress.toFixed(1)}%</div>
            <div className="progress-bar-dashboard">
              <div 
                className="progress-fill-dashboard"
                style={{ width: `${Math.min(stats.averageProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="dashboard-secondary-stats">
        <div className="secondary-stat-card">
          <h4>Active Debts</h4>
          <span className="secondary-value active">{stats.activeDebts}</span>
        </div>
        <div className="secondary-stat-card">
          <h4>Completed</h4>
          <span className="secondary-value completed">{stats.completedDebts}</span>
        </div>
        <div className="secondary-stat-card">
          <h4>Overdue</h4>
          <span className={`secondary-value ${stats.overdueDebts > 0 ? 'overdue' : 'good'}`}>
            {stats.overdueDebts}
          </span>
        </div>
        <div className="secondary-stat-card">
          <h4>Interest Accrued</h4>
          <span className={`secondary-value ${stats.totalInterestAccrued > 0 ? 'interest' : 'good'}`}>
            {formatCurrency(stats.totalInterestAccrued)}
          </span>
        </div>
      </div>

      {/* Bottom Row - Side by Side */}
      <div className="dashboard-bottom-row">
        {/* Highest Debt Alert */}
        {stats.highestDebt && (
          <div className="highest-debt-alert">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <h4>Highest Debt</h4>
              <p>
                <strong>{stats.highestDebt.name}</strong> - {formatCurrency(stats.highestDebt.totalAmount)}
                {stats.highestDebt.totalPaid > 0 && (
                  <span className="paid-info">
                    ({formatCurrency(stats.highestDebt.totalAmount - (stats.highestDebt.totalPaid || 0))} remaining)
                  </span>
                )}
              </p>
            </div>
          </div>
        )}


      </div>

      {/* Empty State */}
      {stats.totalDebts === 0 && (
        <div className="dashboard-empty">
          <div className="empty-icon">🎉</div>
          <h3>No Debts Yet!</h3>
          <p>Start by adding your first debt to track your financial progress.</p>
        </div>
      )}
    </div>
  )
}

