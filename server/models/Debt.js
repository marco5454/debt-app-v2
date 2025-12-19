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
    default: 0,
    min: [0, 'Monthly payment cannot be negative']
  },
  
  // Date when the loan was taken
  dateOfLoan: {
    type: Date,
    required: [true, 'Date of loan is required']
  },
  
  // Creditor/lender name (optional)
  creditor: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Additional description/notes (optional)
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

// Create and export the Debt model
export default mongoose.model('Debt', debtSchema);

