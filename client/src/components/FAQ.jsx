import { useState, useEffect } from 'react'
import './FAQ.css'

function FAQ() {
  const [openQuestion, setOpenQuestion] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [showAllAnswers, setShowAllAnswers] = useState(false)

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index)
  }

  const toggleCategory = (categoryIndex) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryIndex)) {
      newExpanded.delete(categoryIndex)
    } else {
      newExpanded.add(categoryIndex)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleAllAnswers = () => {
    setShowAllAnswers(!showAllAnswers)
    if (!showAllAnswers) {
      setOpenQuestion('all')
    } else {
      setOpenQuestion(null)
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  const faqData = [
    {
      category: "🚀 Getting Started",
      icon: "🚀",
      color: "info",
      questions: [
        {
          question: "How do I create an account?",
          answer: "Click 'Register' on the login page, enter your username and password, then click 'Create Account'. Your account will be created instantly and you'll be logged in automatically.",
          tags: ["account", "register", "signup"]
        },
        {
          question: "What information do I need to track a debt?",
          answer: "You need the debt amount, creditor name (who you owe), and optionally a description. The system automatically tracks the creation date and calculates remaining balance as you make payments.",
          tags: ["debt", "information", "track"]
        },
        {
          question: "Can I use this app for free?",
          answer: "Yes! This debt tracker is completely free to use. There are no subscription fees, hidden costs, or premium features.",
          tags: ["free", "cost", "price"]
        }
      ]
    },
    {
      category: "💼 Managing Debts",
      icon: "💼",
      color: "warning",
      questions: [
        {
          question: "How do I add a new debt?",
          answer: "Click the '+ Add Debt' button in the header. Fill in the debt amount, creditor name, and optional description, then click 'Add Debt'.",
          tags: ["add", "create", "new", "debt"]
        },
        {
          question: "Can I edit a debt after creating it?",
          answer: "Yes! In the 'All Debts' section, click the 'Edit' button next to any debt. You can modify the amount, creditor name, and description.",
          tags: ["edit", "modify", "change"]
        },
        {
          question: "How do I delete a debt?",
          answer: "In the 'All Debts' section, click the 'Delete' button next to the debt you want to remove. This action cannot be undone, so make sure you really want to delete it.",
          tags: ["delete", "remove", "undo"]
        },
        {
          question: "What happens to payments when I delete a debt?",
          answer: "When you delete a debt, all associated payment records are also permanently deleted. This action cannot be undone.",
          tags: ["delete", "payments", "permanent"]
        },
        {
          question: "Is there a limit to how many debts I can track?",
          answer: "No, there's no limit! You can track as many debts as you need - whether it's 1 debt or 100 debts.",
          tags: ["limit", "unlimited", "many"]
        }
      ]
    },
    {
      category: "💸 Payments & Tracking",
      icon: "💸",
      color: "success",
      questions: [
        {
          question: "How do I record a payment?",
          answer: "Click the 'Make Payment' button next to any debt in your dashboard or debt list. Enter the payment amount and click 'Add Payment'. The debt balance will be updated automatically.",
          tags: ["payment", "record", "make", "add"]
        },
        {
          question: "Can I see all my payment history?",
          answer: "Yes! Go to the 'Payments' page to see a complete history of all payments made across all your debts, including dates and amounts.",
          tags: ["history", "payments", "track"]
        },
        {
          question: "What happens when I fully pay off a debt?",
          answer: "When your payments equal or exceed the original debt amount, the debt status will show as 'Fully Paid' and the remaining balance will be $0.00.",
          tags: ["paid", "fully", "complete"]
        },
        {
          question: "Can I make partial payments?",
          answer: "Absolutely! You can make payments of any amount. The system tracks all payments and calculates your remaining balance automatically.",
          tags: ["partial", "amount", "balance"]
        },
        {
          question: "Can I edit or delete a payment after recording it?",
          answer: "Currently, payments cannot be edited or deleted once recorded. Make sure to enter the correct amount when recording payments.",
          tags: ["edit", "delete", "payment"]
        }
      ]
    },
    {
      category: "📊 Dashboard & Reports",
      icon: "📊",
      color: "info",
      questions: [
        {
          question: "What does the dashboard show me?",
          answer: "The dashboard provides an overview of your financial status: total debt amount, total paid so far, remaining balance, and a list of your active debts with quick payment options.",
          tags: ["dashboard", "overview", "summary"]
        },
        {
          question: "How is the 'Total Paid' calculated?",
          answer: "Total Paid is the sum of all payments you've made across all your debts. It shows your overall progress in debt repayment.",
          tags: ["total", "paid", "calculate"]
        },
        {
          question: "What's the difference between 'All Debts' and 'Dashboard'?",
          answer: "Dashboard shows a summary with key metrics and active debts. 'All Debts' shows a complete list of all your debts with options to edit, delete, and manage each one individually.",
          tags: ["dashboard", "debts", "difference"]
        },
        {
          question: "Can I export my debt data?",
          answer: "Currently, there's no export feature, but all your data is securely stored and accessible anytime through the web app.",
          tags: ["export", "data", "download"]
        }
      ]
    },
    {
      category: "🔒 Account & Security",
      icon: "🔒",
      color: "error",
      questions: [
        {
          question: "How secure is my financial data?",
          answer: "Your data is stored securely in an encrypted database. We use industry-standard security practices and never store sensitive information like bank account numbers or SSNs.",
          tags: ["security", "data", "encrypted"]
        },
        {
          question: "Why do I get logged out automatically?",
          answer: "For security, the app automatically logs you out after 2 minutes of inactivity (when you close the tab or switch away). This protects your financial data if you forget to log out.",
          tags: ["logout", "automatic", "security"]
        },
        {
          question: "Can I change my password?",
          answer: "Currently, password changes aren't supported through the app. If you need to change your password, you'll need to create a new account.",
          tags: ["password", "change", "account"]
        },
        {
          question: "What happens if I forget my login details?",
          answer: "Currently, there's no password recovery feature. Make sure to remember your username and password, or consider using a password manager.",
          tags: ["forgot", "password", "recovery"]
        },
        {
          question: "Can multiple people use the same account?",
          answer: "Each account is designed for individual use. All debts and payments are tied to the logged-in user account.",
          tags: ["multiple", "users", "account"]
        }
      ]
    },
    {
      category: "🛠️ Technical Support",
      icon: "🛠️",
      color: "warning",
      questions: [
        {
          question: "Which browsers are supported?",
          answer: "The app works on all modern browsers including Chrome, Firefox, Safari, and Edge. For best experience, use the latest version of your preferred browser.",
          tags: ["browser", "support", "compatibility"]
        },
        {
          question: "Can I use this app on my mobile phone?",
          answer: "Yes! The app is mobile-responsive and works great on smartphones and tablets through your mobile browser.",
          tags: ["mobile", "phone", "responsive"]
        },
        {
          question: "What should I do if the app isn't loading?",
          answer: "Try refreshing the page, clearing your browser cache, or checking your internet connection. If problems persist, try using a different browser.",
          tags: ["loading", "error", "troubleshoot"]
        },
        {
          question: "Why am I seeing 'Network error' when trying to log in?",
          answer: "This usually indicates a connection issue. Check your internet connection and try again. If the error persists, the server might be temporarily unavailable.",
          tags: ["network", "error", "connection"]
        },
        {
          question: "Do I need to install anything to use this app?",
          answer: "No installation required! This is a web app that runs entirely in your browser. Just navigate to the URL and start using it.",
          tags: ["install", "web", "browser"]
        }
      ]
    },
    {
      category: "🛡️ Data & Privacy",
      icon: "🛡️",
      color: "info",
      questions: [
        {
          question: "Where is my data stored?",
          answer: "Your data is stored securely in a cloud database with enterprise-grade security measures. We never share your personal financial information with third parties.",
          tags: ["data", "storage", "cloud"]
        },
        {
          question: "What data does the app collect?",
          answer: "We only collect what's necessary: your username, password (encrypted), and the debt/payment information you choose to enter. No personal identifying information is required.",
          tags: ["collect", "data", "privacy"]
        },
        {
          question: "Can I delete my account and all my data?",
          answer: "Currently, account deletion isn't available through the app interface. If you need your account deleted, you would need to contact support.",
          tags: ["delete", "account", "data"]
        },
        {
          question: "Is my data backed up?",
          answer: "Yes, your data is automatically backed up as part of our database infrastructure. You don't need to worry about losing your debt tracking information.",
          tags: ["backup", "data", "safe"]
        }
      ]
    },
    {
      category: "💡 Tips & Best Practices",
      icon: "💡",
      color: "success",
      questions: [
        {
          question: "How often should I update my debts?",
          answer: "Record payments as soon as you make them for the most accurate tracking. Review your debts weekly to stay on top of your financial progress.",
          tags: ["update", "frequency", "tracking"]
        },
        {
          question: "Should I include all types of debts?",
          answer: "Include any debt you want to track - credit cards, personal loans, money owed to friends/family, etc. The more complete your tracking, the better your financial overview.",
          tags: ["types", "debts", "include"]
        },
        {
          question: "What's the best way to organize my debts?",
          answer: "Use clear, descriptive creditor names like 'Visa Credit Card' or 'Mom - Car Loan'. Add descriptions for context like 'Emergency expenses' or 'Home repairs'.",
          tags: ["organize", "names", "descriptions"]
        },
        {
          question: "How can I stay motivated to pay off debts?",
          answer: "Check your dashboard regularly to see your progress! Watching your 'Total Paid' increase and 'Remaining Balance' decrease can be very motivating.",
          tags: ["motivated", "progress", "dashboard"]
        }
      ]
    }
  ]

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(faqData)
    } else {
      const filtered = faqData.map(category => ({
        ...category,
        questions: category.questions.filter(item => 
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
        )
      })).filter(category => category.questions.length > 0)
      
      setFilteredData(filtered)
    }
  }, [searchTerm])

  const totalQuestions = faqData.reduce((acc, category) => acc + category.questions.length, 0)
  const visibleQuestions = filteredData.reduce((acc, category) => acc + category.questions.length, 0)

  return (
    <div className="faq-container">
      <header className="faq-header">
        <div className="faq-hero">
          <h1>💡 Frequently Asked Questions</h1>
          <p>Find answers to common questions about using your Debt Tracker</p>
          <div className="faq-stats">
            <span className="stat-item">
              <span className="stat-number">{totalQuestions}</span>
              <span className="stat-label">Total Questions</span>
            </span>
            <span className="stat-divider">•</span>
            <span className="stat-item">
              <span className="stat-number">{faqData.length}</span>
              <span className="stat-label">Categories</span>
            </span>
          </div>
        </div>
        
        <div className="faq-controls">
          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search questions, answers, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={clearSearch}>
                  ✕
                </button>
              )}
            </div>
          </div>
          
          <div className="control-buttons">
            <button 
              className={`control-btn ${showAllAnswers ? 'active' : ''}`}
              onClick={toggleAllAnswers}
            >
              {showAllAnswers ? '📖 Collapse All' : '📚 Show All'}
            </button>
          </div>
        </div>
        
        {searchTerm && (
          <div className="search-results-info">
            <span className="results-text">
              Showing {visibleQuestions} of {totalQuestions} questions
              {searchTerm && (
                <span className="search-term"> matching "{searchTerm}"</span>
              )}
            </span>
          </div>
        )}
      </header>

      <div className="faq-content">
        {filteredData.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try adjusting your search terms or browse by category</p>
            <button className="clear-search-btn" onClick={clearSearch}>
              Clear Search
            </button>
          </div>
        ) : (
          filteredData.map((category, categoryIndex) => {
            const isExpanded = expandedCategories.has(categoryIndex)
            const categoryColorClass = `category-${category.color}`
            
            return (
              <div key={categoryIndex} className={`faq-category ${categoryColorClass}`}>
                <div className="faq-category-header">
                  <button 
                    className="category-toggle"
                    onClick={() => toggleCategory(categoryIndex)}
                  >
                    <div className="category-title-content">
                      <span className="category-icon">{category.icon}</span>
                      <h2 className="faq-category-title">{category.category}</h2>
                      <span className="question-count">({category.questions.length})</span>
                    </div>
                    <span className={`category-chevron ${isExpanded ? 'expanded' : ''}`}>⌄</span>
                  </button>
                </div>
                
                <div className={`faq-questions ${isExpanded ? 'expanded' : 'collapsed'}`}>
                  {category.questions.map((item, questionIndex) => {
                    const globalIndex = `${categoryIndex}-${questionIndex}`
                    const isOpen = openQuestion === globalIndex || openQuestion === 'all'
                    
                    return (
                      <div key={questionIndex} className={`faq-item ${isOpen ? 'open' : ''}`}>
                        <button 
                          className="faq-question"
                          onClick={() => toggleQuestion(globalIndex)}
                          aria-expanded={isOpen}
                        >
                          <span className="question-text">{item.question}</span>
                          <span className={`faq-icon ${isOpen ? 'rotate' : ''}`}>⌄</span>
                        </button>
                        
                        <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                          <div className="answer-content">
                            <p>{item.answer}</p>
                            {item.tags && (
                              <div className="answer-tags">
                                {item.tags.map((tag, tagIndex) => (
                                  <span key={tagIndex} className="tag">{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="faq-footer">
        <div className="faq-help-box">
          <div className="help-content">
            <div className="help-main">
              <h3>🤝 Still need help?</h3>
              <p>
                If you couldn't find the answer to your question, try exploring the app's different sections or check out our quick navigation guide below.
              </p>
            </div>
            
            <div className="quick-links">
              <div className="quick-link-group">
                <h4>🏠 Navigation</h4>
                <div className="quick-links-list">
                  <span className="quick-link">Dashboard - Overview & Summary</span>
                  <span className="quick-link">All Debts - Manage Your Debts</span>
                  <span className="quick-link">Payments - Payment History</span>
                  <span className="quick-link">Paid Debts - Completed Debts</span>
                </div>
              </div>
              
              <div className="quick-link-group">
                <h4>⚡ Quick Actions</h4>
                <div className="quick-links-list">
                  <span className="quick-link">+ Add Debt - Create New Debt</span>
                  <span className="quick-link">Make Payment - Record Payment</span>
                  <span className="quick-link">View Stats - Check Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQ