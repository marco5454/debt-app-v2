import mongoose from 'mongoose';

// Define the Debt schema
// This describes the structure of a debt document in MongoDB
const debtSchema = new mongoose.Schema({
  // Reference to the user who owns this debt
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    trim: true
  },
  
  // Name/description of the debt (e.g., "Credit Card", "Car Loan")
  name: {
    type: String,
    required: [true, 'Debt name is required'],
    trim: true
  },
  
  // Total amount owed
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount must be positive']
  },
  
  // Interest rate (optional, stored as percentage)
  interestRate: {
    type: Number,
    default: 0,
    min: [0, 'Interest rate cannot be negative']
  },
  
  // Monthly payment amount
  monthlyPayment: {
    type: Number,
    required: [true, 'Monthly payment is required'],
    min: [0.01, 'Monthly payment must be greater than 0']
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

// Create and export the Debt model
export default mongoose.model('Debt', debtSchema);

