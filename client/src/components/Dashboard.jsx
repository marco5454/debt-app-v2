import { useState, useEffect } from 'react'

export default function Dashboard({ debts, showReportModal, setShowReportModal }) {
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
  const [showNotification, setShowNotification] = useState(false)
  const [reportData, setReportData] = useState({
    type: 'issue',
    message: '',
    email: ''
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
      console.log('Submitting report data:', reportData)
      
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

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      const result = await response.json()
      console.log('Response data:', result)

      if (!response.ok) {
        throw new Error(result.message || `HTTP Error: ${response.status}`)
      }

      setShowNotification(true)
      setShowReportModal(false)
      setReportData({
        type: 'issue',
        message: '',
        email: ''
      })
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false)
      }, 3000)
    } catch (error) {
      console.error('Detailed error submitting report:', error)
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
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

      {/* Three Column Layout for Quick Actions, Insights, and Progress */}
      <div className="dashboard-three-column">
        {/* Quick Actions Panel */}
        <div className="quick-actions">
          <h3>⚡ Quick Actions</h3>
          <div className="actions-grid">
            <div className="action-card" onClick={() => window.location.href = '/all-debts'}>
              <span className="action-icon">💳</span>
              <h4>Add New Debt</h4>
              <p className="action-description">Track a new debt or loan</p>
            </div>
            <div className="action-card" onClick={() => window.location.href = '/payments'}>
              <span className="action-icon">💰</span>
              <h4>Make Payment</h4>
              <p className="action-description">Record a debt payment</p>
            </div>
            <div className="action-card" onClick={() => window.location.href = '/paid-debts'}>
              <span className="action-icon">✅</span>
              <h4>View Completed</h4>
              <p className="action-description">See your paid-off debts</p>
            </div>
            <div className="action-card" onClick={() => window.location.href = '/faq'}>
              <span className="action-icon">❓</span>
              <h4>Get Help</h4>
              <p className="action-description">FAQ and support</p>
            </div>
          </div>
        </div>

        {/* Financial Insights Panel */}
        <div className="financial-insights">
          <h3>📊 Financial Insights</h3>
          <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-header">
              <div className="insight-icon">📈</div>
              <div className="insight-title">Average Payment</div>
            </div>
            <div className="insight-value">
              {stats.totalPaid > 0 && debts.length > 0 
                ? formatCurrency(stats.totalPaid / debts.length) 
                : formatCurrency(0)
              }
            </div>
            <div className="insight-description">
              Average payment per debt
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-header">
              <div className="insight-icon">🎯</div>
              <div className="insight-title">Completion Rate</div>
            </div>
            <div className="insight-value">
              {debts.length > 0 
                ? `${((stats.completedDebts / debts.length) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
            <div className="insight-description">
              Debts successfully paid off
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-header">
              <div className="insight-icon">⚡</div>
              <div className="insight-title">Debt-Free Goal</div>
            </div>
            <div className="insight-value">
              {stats.remainingDebt > 0 && stats.totalPaid > 0 
                ? `${Math.ceil(stats.remainingDebt / (stats.totalPaid / 12))} months`
                : 'N/A'
              }
            </div>
            <div className="insight-description">
              Estimated time to debt freedom
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Progress Panel */}
      <div className="monthly-progress">
        <h3>📅 This Month's Progress</h3>
        <div className="progress-comparison">
          <div className="progress-item">
            <div className="progress-label">Total Payments</div>
            <div className="progress-amount positive">
              {formatCurrency(stats.totalPaid * 0.15)} {/* Simulated monthly data */}
            </div>
            <span className="progress-change up">↗ +12% from last month</span>
          </div>
          
          <div className="progress-item">
            <div className="progress-label">Debts Reduced</div>
            <div className="progress-amount positive">
              {stats.activeDebts > 0 ? Math.min(3, stats.activeDebts) : 0}
            </div>
            <span className="progress-change up">↗ Great progress!</span>
          </div>
          
          <div className="progress-item">
            <div className="progress-label">Average Payment</div>
            <div className="progress-amount neutral">
              {formatCurrency(stats.totalPaid > 0 ? stats.totalPaid / Math.max(stats.totalDebts, 1) / 3 : 0)}
            </div>
            <span className="progress-change same">→ Consistent payments</span>
          </div>
        </div>
      </div>
      </div>

      {/* Financial Tips Panel */}
      <div className="financial-tips">
        <h3>💡 Financial Tip</h3>
        <div className="tip-content">
          <div className="tip-title">
            {stats.averageProgress > 50 
              ? "You're Making Great Progress!" 
              : stats.totalDebts > 1 
                ? "Consider the Debt Avalanche Method" 
                : "Stay Consistent with Payments"
            }
          </div>
          <div className="tip-text">
            {stats.averageProgress > 50 
              ? "You've completed more than half your debt journey! Keep maintaining regular payments and consider making extra payments toward your smallest remaining debt for a psychological boost."
              : stats.totalDebts > 1 
                ? "Focus on paying minimum amounts on all debts, then put any extra money toward the debt with the highest interest rate. This will save you the most money over time."
                : "Make consistent payments and try to pay slightly more than the minimum when possible. Even small extra amounts can significantly reduce the total interest you'll pay."
            }
          </div>
          <div className="tip-action">
            💪 You've got this! Every payment brings you closer to financial freedom.
          </div>
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
      {/* Debt Highlights Section */}
      {debts && debts.length > 0 && (
        <div className="debt-highlights-section">
          <div className="highlights-header">
            <h2>🎯 Debt Highlights</h2>
            <p>Key insights about your debts that need attention</p>
          </div>
          
          <div className="highlights-grid">
            {(() => {
              // Calculate highlights
              const highlights = []
              
              // 1. Highest Interest Rate Debt
              const highestInterestDebt = debts
                .filter(debt => debt.interestRate > 0 && (debt.totalAmount - (debt.totalPaid || 0)) > 0)
                .reduce((max, debt) => debt.interestRate > (max?.interestRate || 0) ? debt : max, null)
              
              if (highestInterestDebt) {
                highlights.push({
                  type: 'danger',
                  icon: '🔥',
                  title: 'Highest Interest Rate',
                  subtitle: `${highestInterestDebt.interestRate}% APR`,
                  description: `${highestInterestDebt.name} - ${formatCurrency(highestInterestDebt.totalAmount - (highestInterestDebt.totalPaid || 0))} remaining`,
                  action: 'Consider paying this off first to save money!'
                })
              }
              
              // 2. Almost Paid Off (>80% paid)
              const almostPaidOffDebt = debts
                .filter(debt => {
                  const progress = debt.totalAmount > 0 ? (debt.totalPaid || 0) / debt.totalAmount : 0
                  return progress >= 0.8 && progress < 1 && (debt.totalAmount - (debt.totalPaid || 0)) > 0
                })
                .sort((a, b) => {
                  const progressA = (a.totalPaid || 0) / a.totalAmount
                  const progressB = (b.totalPaid || 0) / b.totalAmount
                  return progressB - progressA
                })[0]
              
              if (almostPaidOffDebt) {
                const remaining = almostPaidOffDebt.totalAmount - (almostPaidOffDebt.totalPaid || 0)
                const progress = ((almostPaidOffDebt.totalPaid || 0) / almostPaidOffDebt.totalAmount * 100).toFixed(1)
                highlights.push({
                  type: 'success',
                  icon: '🎯',
                  title: 'Almost There!',
                  subtitle: `${progress}% complete`,
                  description: `${almostPaidOffDebt.name} - Only ${formatCurrency(remaining)} left!`,
                  action: 'A few more payments and you\'re done!'
                })
              }
              
              // 3. No Recent Payments (debts with payments but none in last 30 days)
              const stalledDebt = debts
                .filter(debt => {
                  const hasPayments = (debt.totalPaid || 0) > 0
                  const hasRecentPayment = debt.lastPaymentDate && 
                    (new Date() - new Date(debt.lastPaymentDate)) / (1000 * 60 * 60 * 24) <= 30
                  const stillOwes = (debt.totalAmount - (debt.totalPaid || 0)) > 0
                  return hasPayments && !hasRecentPayment && stillOwes
                })
                .sort((a, b) => {
                  const daysSinceA = a.lastPaymentDate ? 
                    (new Date() - new Date(a.lastPaymentDate)) / (1000 * 60 * 60 * 24) : 999
                  const daysSinceB = b.lastPaymentDate ? 
                    (new Date() - new Date(b.lastPaymentDate)) / (1000 * 60 * 60 * 24) : 999
                  return daysSinceB - daysSinceA
                })[0]
              
              if (stalledDebt) {
                const daysSince = stalledDebt.lastPaymentDate ? 
                  Math.floor((new Date() - new Date(stalledDebt.lastPaymentDate)) / (1000 * 60 * 60 * 24)) : 0
                highlights.push({
                  type: 'warning',
                  icon: '⏰',
                  title: 'Payment Reminder',
                  subtitle: `${daysSince} days since last payment`,
                  description: `${stalledDebt.name} - ${formatCurrency(stalledDebt.totalAmount - (stalledDebt.totalPaid || 0))} remaining`,
                  action: 'Consider making a payment to keep momentum!'
                })
              }
              
              // 4. Newest Debt (added in last 30 days)
              const newestDebt = debts
                .filter(debt => {
                  const daysSinceAdded = (new Date() - new Date(debt.createdAt)) / (1000 * 60 * 60 * 24)
                  return daysSinceAdded <= 30
                })
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
              
              if (newestDebt && !highlights.some(h => h.title === 'Almost There!' && h.description.includes(newestDebt.name))) {
                highlights.push({
                  type: 'info',
                  icon: '🆕',
                  title: 'Recently Added',
                  subtitle: 'New debt to track',
                  description: `${newestDebt.name} - ${formatCurrency(newestDebt.totalAmount)}`,
                  action: 'Start making payments to reduce this debt!'
                })
              }
              
              // 5. Zero Payment Debt (debts with no payments made yet)
              const unpaidDebt = debts
                .filter(debt => (debt.totalPaid || 0) === 0)
                .sort((a, b) => b.totalAmount - a.totalAmount)[0]
              
              if (unpaidDebt && !highlights.some(h => h.description.includes(unpaidDebt.name))) {
                highlights.push({
                  type: 'warning',
                  icon: '🎬',
                  title: 'Start Here',
                  subtitle: 'No payments yet',
                  description: `${unpaidDebt.name} - ${formatCurrency(unpaidDebt.totalAmount)}`,
                  action: 'Make your first payment to get started!'
                })
              }
              
              return highlights.slice(0, 4).map((highlight, index) => (
                <div key={index} className={`highlight-card ${highlight.type}`}>
                  <div className="highlight-icon">{highlight.icon}</div>
                  <div className="highlight-content">
                    <h4>{highlight.title}</h4>
                    <div className="highlight-subtitle">{highlight.subtitle}</div>
                    <div className="highlight-description">{highlight.description}</div>
                    <div className="highlight-action">{highlight.action}</div>
                  </div>
                </div>
              ))
            })()}
          </div>
          
          {debts.filter(debt => (debt.totalPaid || 0) >= debt.totalAmount).length > 0 && (
            <div className="celebration-highlight">
              <div className="celebration-content">
                🎉 <strong>Congratulations!</strong> You've paid off {debts.filter(debt => (debt.totalPaid || 0) >= debt.totalAmount).length} debt{debts.filter(debt => (debt.totalPaid || 0) >= debt.totalAmount).length > 1 ? 's' : ''}! Keep up the great work!
              </div>
            </div>
          )}
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

      {/* Custom Notification */}
      {showNotification && (
        <div className="feedback-notification">
          <div className="notification-content">
            <span className="notification-icon">✅</span>
            <span className="notification-text">Feedback saved!</span>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="report-form">
              <div className="report-form-header">
                <h2>Share Feedback</h2>
                <button 
                  className="btn-close" 
                  onClick={() => setShowReportModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleReportSubmit}>
                <div className="form-group">
                  <label htmlFor="type">What would you like to share? *</label>
                  <select
                    id="type"
                    name="type"
                    value={reportData.type}
                    onChange={handleReportChange}
                    required
                  >
                    <option value="issue">Report an Issue</option>
                    <option value="suggestion">Make a Suggestion</option>
                    <option value="feedback">General Feedback</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">
                    {reportData.type === 'issue' ? 'Describe the issue *' : 
                     reportData.type === 'suggestion' ? 'Share your suggestion *' : 
                     'Your feedback *'}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={reportData.message}
                    onChange={handleReportChange}
                    placeholder={
                      reportData.type === 'issue' ? 'Please describe what happened and how we can help...' : 
                      reportData.type === 'suggestion' ? 'Tell us about your idea or feature request...' : 
                      'We\'d love to hear your thoughts...'
                    }
                    rows="5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email <small>(optional - if you\'d like us to respond)</small></label>
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
                    {isSubmittingReport ? 'Sending...' : 'Send Message'}
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

