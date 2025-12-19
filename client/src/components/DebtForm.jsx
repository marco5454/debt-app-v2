import { useEffect, useState } from 'react'

function DebtForm({ onAddDebt, onUpdateDebt, debtToEdit, onClose }) {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    interestRate: '',
    monthlyPayment: '',
    dateOfLoan: '',
    creditor: '',
    description: ''
  })
  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Error state for form validation
  const [formError, setFormError] = useState('')

  const isEditMode = Boolean(debtToEdit)

  useEffect(() => {
    if (debtToEdit) {
      setFormData({
        name: debtToEdit.name || '',
        totalAmount: debtToEdit.totalAmount?.toString() || '',
        interestRate: debtToEdit.interestRate !== undefined ? debtToEdit.interestRate.toString() : '',
        monthlyPayment: debtToEdit.monthlyPayment !== undefined ? debtToEdit.monthlyPayment.toString() : '',
        dateOfLoan: debtToEdit.dateOfLoan ? new Date(debtToEdit.dateOfLoan).toISOString().split('T')[0] : '',
        creditor: debtToEdit.creditor || '',
        description: debtToEdit.description || ''
      })
      setFormError('')
    } else {
      setFormData({
        name: '',
        totalAmount: '',
        interestRate: '',
        monthlyPayment: '',
        dateOfLoan: '',
        creditor: '',
        description: ''
      })
      setFormError('')
    }
  }, [debtToEdit])

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
    if (!formData.name.trim() || !formData.totalAmount || !formData.dateOfLoan) {
      setFormError('Please fill in all required fields')
      return
    }

    // Validate numeric values
    const totalAmount = parseFloat(formData.totalAmount)
    const monthlyPayment = formData.monthlyPayment ? parseFloat(formData.monthlyPayment) : 0
    const interestRate = formData.interestRate ? parseFloat(formData.interestRate) : 0

    if (isNaN(totalAmount) || totalAmount <= 0) {
      setFormError('Total amount must be a positive number')
      return
    }

    if (formData.monthlyPayment && (isNaN(monthlyPayment) || monthlyPayment <= 0)) {
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
      interestRate,
      dateOfLoan: formData.dateOfLoan,
      creditor: formData.creditor.trim(),
      description: formData.description.trim()
    }

    try {
      setIsSubmitting(true)
      if (isEditMode) {
        await onUpdateDebt(debtToEdit._id, debtData)
      } else {
        await onAddDebt(debtData)
      }

      // Reset form on success
      setFormData({
        name: '',
        totalAmount: '',
        interestRate: '',
        monthlyPayment: '',
        dateOfLoan: '',
        creditor: '',
        description: ''
      })
      
      // Close modal after successful submission
      if (onClose) {
        onClose()
      }
    } catch (err) {
      setFormError(err.message || (isEditMode ? 'Failed to update debt' : 'Failed to add debt'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="debt-form">
      <div className="debt-form-header">
        <h2>{isEditMode ? 'Update Debt' : 'Add New Debt'}</h2>
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
            Monthly Payment (₱) <small>(optional)</small>
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="dateOfLoan">
            Date of Loan <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="date"
            id="dateOfLoan"
            name="dateOfLoan"
            value={formData.dateOfLoan}
            onChange={handleChange}
            required
          />
          <small>When did you take this loan?</small>
        </div>

        <div className="form-group">
          <label htmlFor="creditor">
            Creditor/Lender <small>(optional)</small>
          </label>
          <input
            type="text"
            id="creditor"
            name="creditor"
            value={formData.creditor}
            onChange={handleChange}
            placeholder="e.g., Bank ABC, Credit Card Company"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description/Notes <small>(optional)</small>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Additional notes about this debt..."
            rows="3"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Debt' : 'Add Debt')}
        </button>
      </form>
    </div>
  )
}

export default DebtForm

