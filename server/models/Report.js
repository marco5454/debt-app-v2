import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['bug', 'feature', 'improvement', 'issue', 'feedback']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'dashboard', 'payments', 'debts', 'ui', 'performance', 'security'],
    default: 'general'
  },
  suggestions: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional since user might not be logged in
  },
  userAgent: {
    type: String
  },
  ipAddress: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update the updatedAt field before saving
reportSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

// Create indexes for better query performance
reportSchema.index({ type: 1, status: 1 })
reportSchema.index({ priority: 1 })
reportSchema.index({ createdAt: -1 })

export default mongoose.model('Report', reportSchema)