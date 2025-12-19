import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    trim: true,
  },
  debtId: {
    type: String,
    required: [true, 'Debt ID is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount must be positive'],
  },
  method: {
    type: String,
    trim: true,
    default: 'Other',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Payment', paymentSchema);
