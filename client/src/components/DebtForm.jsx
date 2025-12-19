import { useState } from 'react'

function DebtForm({ onAddDebt, onClose }) {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    interestRate: '',
    monthlyPayment: ''
  })
  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Error state for form validation
  const [formError, setFormError] = useState('')

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (formError) {
      setFormError('')
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    // Validate required fields
    if (!formData.name.trim() || !formData.totalAmount || !formData.monthlyPayment) {
      setFormError('Please fill in all required fields')
      return
    }

    // Validate numeric values
    const totalAmount = parseFloat(formData.totalAmount)
    const monthlyPayment = parseFloat(formData.monthlyPayment)
    const interestRate = formData.interestRate ? parseFloat(formData.interestRate) : 0

    if (isNaN(totalAmount) || totalAmount <= 0) {
      setFormError('Total amount must be a positive number')
      return
    }

    if (isNaN(monthlyPayment) || monthlyPayment <= 0) {
      setFormError('Monthly payment must be a positive number')
      return
    }

    if (monthlyPayment >= totalAmount) {
      setFormError('Monthly payment must be less than total amount')
      return
    }

    if (formData.interestRate && (isNaN(interestRate) || interestRate < 0)) {
      setFormError('Interest rate must be a non-negative number')
      return
    }

    // Prepare debt data
    const debtData = {
      name: formData.name.trim(),
      totalAmount,
      monthlyPayment,
      interestRate
    }

    try {
      setIsSubmitting(true)
      await onAddDebt(debtData)
      
      // Reset form on success
      setFormData({
        name: '',
        totalAmount: '',
        interestRate: '',
        monthlyPayment: ''
      })
      
      // Close modal after successful submission
      if (onClose) {
        onClose()
      }
    } catch (err) {
      setFormError(err.message || 'Failed to add debt')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="debt-form">
      <div className="debt-form-header">
        <h2>Add New Debt</h2>
        <button 
          className="btn-close" 
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      
      {formError && (
        <div className="error" style={{ marginBottom: '20px' }}>
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">
            Debt Name <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Credit Card, Car Loan"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="totalAmount">
            Total Amount (₱) <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="number"
            id="totalAmount"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="interestRate">
            Interest Rate (%) <small>(optional)</small>
          </label>
          <input
            type="number"
            id="interestRate"
            name="interestRate"
            value={formData.interestRate}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
          <small>Annual interest rate percentage</small>
        </div>

        <div className="form-group">
          <label htmlFor="monthlyPayment">
            Monthly Payment (₱) <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="number"
            id="monthlyPayment"
            name="monthlyPayment"
            value={formData.monthlyPayment}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Debt'}
        </button>
      </form>
    </div>
  )
}

export default DebtForm

