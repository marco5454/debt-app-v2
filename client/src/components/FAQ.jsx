import { useState } from 'react'
import './FAQ.css'

function FAQ() {
  const [openQuestion, setOpenQuestion] = useState(null)

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index)
  }

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I create an account?",
          answer: "Click 'Register' on the login page, enter your username and password, then click 'Create Account'. Your account will be created instantly and you'll be logged in automatically."
        },
        {
          question: "What information do I need to track a debt?",
          answer: "You need the debt amount, creditor name (who you owe), and optionally a description. The system automatically tracks the creation date and calculates remaining balance as you make payments."
        },
        {
          question: "Can I use this app for free?",
          answer: "Yes! This debt tracker is completely free to use. There are no subscription fees, hidden costs, or premium features."
        }
      ]
    },
    {
      category: "Managing Debts",
      questions: [
        {
          question: "How do I add a new debt?",
          answer: "Click the '+ Add Debt' button in the header. Fill in the debt amount, creditor name, and optional description, then click 'Add Debt'."
        },
        {
          question: "Can I edit a debt after creating it?",
          answer: "Yes! In the 'All Debts' section, click the 'Edit' button next to any debt. You can modify the amount, creditor name, and description."
        },
        {
          question: "How do I delete a debt?",
          answer: "In the 'All Debts' section, click the 'Delete' button next to the debt you want to remove. This action cannot be undone, so make sure you really want to delete it."
        },
        {
          question: "What happens to payments when I delete a debt?",
          answer: "When you delete a debt, all associated payment records are also permanently deleted. This action cannot be undone."
        },
        {
          question: "Is there a limit to how many debts I can track?",
          answer: "No, there's no limit! You can track as many debts as you need - whether it's 1 debt or 100 debts."
        }
      ]
    },
    {
      category: "Payments & Tracking",
      questions: [
        {
          question: "How do I record a payment?",
          answer: "Click the 'Make Payment' button next to any debt in your dashboard or debt list. Enter the payment amount and click 'Add Payment'. The debt balance will be updated automatically."
        },
        {
          question: "Can I see all my payment history?",
          answer: "Yes! Go to the 'Payments' page to see a complete history of all payments made across all your debts, including dates and amounts."
        },
        {
          question: "What happens when I fully pay off a debt?",
          answer: "When your payments equal or exceed the original debt amount, the debt status will show as 'Fully Paid' and the remaining balance will be $0.00."
        },
        {
          question: "Can I make partial payments?",
          answer: "Absolutely! You can make payments of any amount. The system tracks all payments and calculates your remaining balance automatically."
        },
        {
          question: "Can I edit or delete a payment after recording it?",
          answer: "Currently, payments cannot be edited or deleted once recorded. Make sure to enter the correct amount when recording payments."
        }
      ]
    },
    {
      category: "Dashboard & Reports",
      questions: [
        {
          question: "What does the dashboard show me?",
          answer: "The dashboard provides an overview of your financial status: total debt amount, total paid so far, remaining balance, and a list of your active debts with quick payment options."
        },
        {
          question: "How is the 'Total Paid' calculated?",
          answer: "Total Paid is the sum of all payments you've made across all your debts. It shows your overall progress in debt repayment."
        },
        {
          question: "What's the difference between 'All Debts' and 'Dashboard'?",
          answer: "Dashboard shows a summary with key metrics and active debts. 'All Debts' shows a complete list of all your debts with options to edit, delete, and manage each one individually."
        },
        {
          question: "Can I export my debt data?",
          answer: "Currently, there's no export feature, but all your data is securely stored and accessible anytime through the web app."
        }
      ]
    },
    {
      category: "Account & Security",
      questions: [
        {
          question: "How secure is my financial data?",
          answer: "Your data is stored securely in an encrypted database. We use industry-standard security practices and never store sensitive information like bank account numbers or SSNs."
        },
        {
          question: "Why do I get logged out automatically?",
          answer: "For security, the app automatically logs you out after 2 minutes of inactivity (when you close the tab or switch away). This protects your financial data if you forget to log out."
        },
        {
          question: "Can I change my password?",
          answer: "Currently, password changes aren't supported through the app. If you need to change your password, you'll need to create a new account."
        },
        {
          question: "What happens if I forget my login details?",
          answer: "Currently, there's no password recovery feature. Make sure to remember your username and password, or consider using a password manager."
        },
        {
          question: "Can multiple people use the same account?",
          answer: "Each account is designed for individual use. All debts and payments are tied to the logged-in user account."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "Which browsers are supported?",
          answer: "The app works on all modern browsers including Chrome, Firefox, Safari, and Edge. For best experience, use the latest version of your preferred browser."
        },
        {
          question: "Can I use this app on my mobile phone?",
          answer: "Yes! The app is mobile-responsive and works great on smartphones and tablets through your mobile browser."
        },
        {
          question: "What should I do if the app isn't loading?",
          answer: "Try refreshing the page, clearing your browser cache, or checking your internet connection. If problems persist, try using a different browser."
        },
        {
          question: "Why am I seeing 'Network error' when trying to log in?",
          answer: "This usually indicates a connection issue. Check your internet connection and try again. If the error persists, the server might be temporarily unavailable."
        },
        {
          question: "Do I need to install anything to use this app?",
          answer: "No installation required! This is a web app that runs entirely in your browser. Just navigate to the URL and start using it."
        }
      ]
    },
    {
      category: "Data & Privacy",
      questions: [
        {
          question: "Where is my data stored?",
          answer: "Your data is stored securely in a cloud database with enterprise-grade security measures. We never share your personal financial information with third parties."
        },
        {
          question: "What data does the app collect?",
          answer: "We only collect what's necessary: your username, password (encrypted), and the debt/payment information you choose to enter. No personal identifying information is required."
        },
        {
          question: "Can I delete my account and all my data?",
          answer: "Currently, account deletion isn't available through the app interface. If you need your account deleted, you would need to contact support."
        },
        {
          question: "Is my data backed up?",
          answer: "Yes, your data is automatically backed up as part of our database infrastructure. You don't need to worry about losing your debt tracking information."
        }
      ]
    },
    {
      category: "Tips & Best Practices",
      questions: [
        {
          question: "How often should I update my debts?",
          answer: "Record payments as soon as you make them for the most accurate tracking. Review your debts weekly to stay on top of your financial progress."
        },
        {
          question: "Should I include all types of debts?",
          answer: "Include any debt you want to track - credit cards, personal loans, money owed to friends/family, etc. The more complete your tracking, the better your financial overview."
        },
        {
          question: "What's the best way to organize my debts?",
          answer: "Use clear, descriptive creditor names like 'Visa Credit Card' or 'Mom - Car Loan'. Add descriptions for context like 'Emergency expenses' or 'Home repairs'."
        },
        {
          question: "How can I stay motivated to pay off debts?",
          answer: "Check your dashboard regularly to see your progress! Watching your 'Total Paid' increase and 'Remaining Balance' decrease can be very motivating."
        }
      ]
    }
  ]

  return (
    <div className="faq-container">
      <header className="faq-header">
        <h1>💡 Frequently Asked Questions</h1>
        <p>Find answers to common questions about using your Debt Tracker</p>
      </header>

      <div className="faq-content">
        {faqData.map((category, categoryIndex) => (
          <div key={categoryIndex} className="faq-category">
            <h2 className="faq-category-title">{category.category}</h2>
            
            <div className="faq-questions">
              {category.questions.map((item, questionIndex) => {
                const globalIndex = `${categoryIndex}-${questionIndex}`
                const isOpen = openQuestion === globalIndex
                
                return (
                  <div key={questionIndex} className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button 
                      className="faq-question"
                      onClick={() => toggleQuestion(globalIndex)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.question}</span>
                      <span className={`faq-icon ${isOpen ? 'rotate' : ''}`}>▼</span>
                    </button>
                    
                    {isOpen && (
                      <div className="faq-answer">
                        <p>{item.answer}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="faq-footer">
        <div className="faq-help-box">
          <h3>Still need help?</h3>
          <p>
            If you couldn't find the answer to your question, try exploring the app's different sections:
            <strong> Dashboard</strong> for overview, <strong>All Debts</strong> for debt management, 
            and <strong>Payments</strong> for payment history.
          </p>
        </div>
      </div>
    </div>
  )
}

export default FAQ