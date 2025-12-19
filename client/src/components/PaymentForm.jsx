import { useState } from 'react'

export default function PaymentForm({ debt, onAddPayment, onClose }) {
  const [formData, setFormData] = useState({
    amount: '',
    method: 'cash',
    note: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (formError) setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    const amount = parseFloat(formData.amount)
    if (!amount || amount <= 0) {
      setFormError('Please enter a valid payment amount')
      return
    }

    if (amount > debt.remainingAmount) {
      setFormError('Payment amount cannot exceed remaining debt')
      return
    }

    const paymentData = {
      debtId: debt._id,
      amount,
      method: formData.method,
      note: formData.note.trim(),
      date: new Date().toISOString()
    }

    try {
      setIsSubmitting(true)
      await onAddPayment(paymentData)
      
      setFormData({
        amount: '',
        method: 'cash',
        note: ''
      })
      
      if (onClose) onClose()
    } catch (err) {
      setFormError(err.message || 'Failed to record payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount || 0)
  }

  return (
    <div className="payment-form">
      <div className="payment-form-header">
        <h2>Make Payment</h2>
        <button 
          className="btn-close" 
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="debt-info">
        <h3>{debt.name}</h3>
        <div className="debt-details">
          <div className="debt-detail">
            <span>Total Amount:</span>
            <span>{formatCurrency(debt.totalAmount)}</span>
          </div>
          <div className="debt-detail">
            <span>Paid So Far:</span>
            <span>{formatCurrency(debt.totalPaid || 0)}</span>
          </div>
          <div className="debt-detail">
            <span>Remaining:</span>
            <span className="remaining-amount">{formatCurrency(debt.remainingAmount || debt.totalAmount - (debt.totalPaid || 0))}</span>
          </div>
        </div>
      </div>
      
      {formError && (
        <div className="error" style={{ marginBottom: '20px' }}>
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="amount">
            Payment Amount (₱) <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            max={debt.remainingAmount || debt.totalAmount - (debt.totalPaid || 0)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="method">
            Payment Method
          </label>
          <select
            id="method"
            name="method"
            value={formData.method}
            onChange={handleChange}
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="check">Check</option>
            <option value="online">Online Payment</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="note">
            Note <small>(optional)</small>
          </label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Additional notes about this payment..."
            rows="3"
          />
        </div>

        <div className="payment-form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Recording...' : 'Record Payment'}
          </button>
        </div>
      </form>
    </div>
  )
}