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
    totalInterestAccrued: 0,
    monthlyInterest: 0,
    annualInterest: 0
  })
  
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportData, setReportData] = useState({
    type: 'bug',
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    email: '',
    suggestions: ''
  })
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)

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
        totalInterestAccrued: 0,
        monthlyInterest: 0,
        annualInterest: 0
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
    
    // Calculate comprehensive interest data
    let overdueCount = 0
    let totalInterestAccrued = 0
    let totalMonthlyInterest = 0
    let totalAnnualInterest = 0

    debts.forEach(debt => {
      const interestRate = debt.interestRate || 0
      const remainingBalance = Math.max(debt.totalAmount - (debt.totalPaid || 0), 0)
      
      if (interestRate > 0 && remainingBalance > 0) {
        // Calculate monthly and annual interest on remaining balance
        const monthlyRate = interestRate / 100 / 12
        const annualRate = interestRate / 100
        
        const monthlyInterest = remainingBalance * monthlyRate
        const annualInterest = remainingBalance * annualRate
        
        totalMonthlyInterest += monthlyInterest
        totalAnnualInterest += annualInterest
        
        // Calculate overdue interest
        if (debt.monthlyPayment > 0) {
          const loanDate = new Date(debt.dateOfLoan)
          const currentDate = new Date()
          const monthsElapsed = Math.floor((currentDate - loanDate) / (1000 * 60 * 60 * 24 * 30.44))
          const expectedPayments = monthsElapsed * debt.monthlyPayment
          const actualPaid = debt.totalPaid || 0
          
          if (expectedPayments > actualPaid) {
            overdueCount++
            const overdueAmount = expectedPayments - actualPaid
            const interestAccrued = Math.max(overdueAmount * monthlyRate * monthsElapsed, 0)
            totalInterestAccrued += interestAccrued
          }
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
      totalInterestAccrued,
      monthlyInterest: totalMonthlyInterest,
      annualInterest: totalAnnualInterest
    })
  }, [debts])

  const handleReportChange = (e) => {
    const { name, value } = e.target
    setReportData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleReportSubmit = async (e) => {
    e.preventDefault()
    setIsSubmittingReport(true)
    
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify(reportData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit report')
      }

      alert('Thank you for your report! We\'ll review it and get back to you.')
      setShowReportModal(false)
      setReportData({
        type: 'bug',
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        email: '',
        suggestions: ''
      })
    } catch (error) {
      console.error('Error submitting report:', error)
      alert(`Failed to submit report: ${error.message}`)
    } finally {
      setIsSubmittingReport(false)
    }
  }

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
        <div className="dashboard-title-section">
          <h1>Debt Overview</h1>
          <p>Your complete financial debt summary</p>
        </div>
        <button 
          className="btn-report"
          onClick={() => setShowReportModal(true)}
          title="Report issues or send suggestions"
        >
          <span className="report-icon">📋</span>
          Report Issue
        </button>
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

      {/* Interest Tracking Section */}
      {(stats.monthlyInterest > 0 || stats.annualInterest > 0) && (
        <div className="interest-section">
          <div className="interest-header">
            <h2>💹 Interest Analysis</h2>
            <p>Based on your current outstanding balances and interest rates</p>
          </div>
          
          <div className="interest-stats">
            <div className="interest-card monthly">
              <div className="interest-icon">📅</div>
              <div className="interest-content">
                <h3>Monthly Interest</h3>
                <div className="interest-value">{formatCurrency(stats.monthlyInterest)}</div>
                <div className="interest-description">
                  Interest accruing per month on remaining balances
                </div>
              </div>
            </div>
            
            <div className="interest-card annual">
              <div className="interest-icon">📈</div>
              <div className="interest-content">
                <h3>Annual Interest</h3>
                <div className="interest-value">{formatCurrency(stats.annualInterest)}</div>
                <div className="interest-description">
                  Total interest per year on current balances
                </div>
              </div>
            </div>
          </div>
          
          <div className="interest-insight">
            <div className="insight-box">
              <h4>💡 Interest Insights</h4>
              <div className="insight-content">
                {stats.monthlyInterest > 0 ? (
                  <p>
                    You're currently paying <strong>{formatCurrency(stats.monthlyInterest)}</strong> in 
                    interest each month. Making extra payments can significantly reduce your total interest cost!
                  </p>
                ) : (
                  <p>Great job! You have no active interest-bearing debts.</p>
                )}
                {stats.annualInterest > stats.monthlyInterest * 12 && (
                  <p className="compound-warning">
                    ⚠️ Compound interest effect detected. Consider prioritizing higher interest rate debts.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="report-form">
              <div className="report-form-header">
                <h2>Send Report</h2>
                <button 
                  className="btn-close" 
                  onClick={() => setShowReportModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleReportSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="type">Report Type *</label>
                    <select
                      id="type"
                      name="type"
                      value={reportData.type}
                      onChange={handleReportChange}
                      required
                    >
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="improvement">Improvement Suggestion</option>
                      <option value="issue">General Issue</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="priority">Priority</label>
                    <select
                      id="priority"
                      name="priority"
                      value={reportData.priority}
                      onChange={handleReportChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={reportData.category}
                    onChange={handleReportChange}
                  >
                    <option value="general">General</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="payments">Payments</option>
                    <option value="debts">Debt Management</option>
                    <option value="ui">User Interface</option>
                    <option value="performance">Performance</option>
                    <option value="security">Security</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={reportData.title}
                    onChange={handleReportChange}
                    placeholder="Brief description of the issue or suggestion"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={reportData.description}
                    onChange={handleReportChange}
                    placeholder="Please provide detailed information about the issue, steps to reproduce, or your suggestion..."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="suggestions">Suggestions or Solutions</label>
                  <textarea
                    id="suggestions"
                    name="suggestions"
                    value={reportData.suggestions}
                    onChange={handleReportChange}
                    placeholder="Any suggestions for improvement or potential solutions?"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email <small>(optional)</small></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={reportData.email}
                    onChange={handleReportChange}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="report-form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowReportModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmittingReport}
                  >
                    {isSubmittingReport ? 'Submitting...' : 'Send Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

