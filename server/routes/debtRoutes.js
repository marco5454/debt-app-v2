import express from 'express';
import mongoose from 'mongoose';
import Debt from '../models/Debt.js';

const router = express.Router();

// Middleware to check MongoDB connection
const checkDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: 'Service temporarily unavailable. Please try again in a few moments.',
      error: 'Service unavailable'
    });
  }
  next();
};

// Apply database connection check to all routes
router.use(checkDatabaseConnection);

// GET /debts - Retrieve all debts for a specific user
// Query parameter: userId (required)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Validate userId is provided
    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is required. Please provide userId as a query parameter.' 
      });
    }
    
    // Find all debts for this specific user
    // Only return debts that have userId field AND it matches the provided userId
    // This excludes old debts created before userId was added
    const query = { userId: String(userId) };
    
    console.log('Fetching debts for userId:', userId);
    const debts = await Debt.find(query).sort({ createdAt: -1 }); // Sort by newest first
    console.log(`Found ${debts.length} debts for userId: ${userId}`);
    
    res.status(200).json(debts);
  } catch (error) {
    // Handle any errors that occur during database query
    console.error('Error fetching debts:', error);
    res.status(500).json({ message: 'Error fetching debts', error: error.message });
  }
});

// POST /debts - Create a new debt
// Expects JSON body with: userId, name, totalAmount, interestRate (optional), monthlyPayment (optional), dateOfLoan, creditor (optional), description (optional)
router.post('/', async (req, res) => {
  try {
    // Extract debt data from request body
    const { userId, name, totalAmount, interestRate, monthlyPayment, dateOfLoan, creditor, description } = req.body;
    
    // Validate required fields
    if (!userId || !name || !totalAmount || !dateOfLoan) {
      return res.status(400).json({ 
        message: 'Missing required fields: userId, name, totalAmount, and dateOfLoan are required' 
      });
    }
    
    // Validate that monthly payment is less than total amount (if provided)
    if (monthlyPayment && monthlyPayment >= totalAmount) {
      return res.status(400).json({ 
        message: 'Monthly payment must be less than total amount' 
      });
    }
    
    // Create new debt document associated with the user
    const newDebt = new Debt({
      userId,
      name,
      totalAmount,
      interestRate: interestRate || 0,
      monthlyPayment: monthlyPayment || 0,
      dateOfLoan: new Date(dateOfLoan),
      creditor: creditor || '',
      description: description || '',
      // Initialize payment summary fields
      totalPaid: 0,
      remainingAmount: totalAmount,
      lastPaymentAmount: 0,
      lastPaymentDate: null,
    });
    
    // Save to database
    const savedDebt = await newDebt.save();
    
    // Return the created debt
    res.status(201).json(savedDebt);
  } catch (error) {
    // Handle validation errors or other database errors
    res.status(400).json({ message: 'Error creating debt', error: error.message });
  }
});

// PUT /debts/:id - Update an existing debt
// Expects JSON body with userId (required) and any updatable fields
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userId, name, totalAmount, interestRate, monthlyPayment, dateOfLoan, creditor, description } = req.body

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required to update a debt' })
    }

    const debt = await Debt.findById(id)
    if (!debt) {
      return res.status(404).json({ message: 'Debt not found' })
    }

    if (debt.userId !== String(userId)) {
      return res.status(403).json({ message: 'You do not have permission to update this debt' })
    }

    const updates = {}
    if (name !== undefined) updates.name = name
    if (totalAmount !== undefined) updates.totalAmount = totalAmount
    if (interestRate !== undefined) updates.interestRate = interestRate
    if (monthlyPayment !== undefined) updates.monthlyPayment = monthlyPayment
    if (dateOfLoan !== undefined) updates.dateOfLoan = new Date(dateOfLoan)
    if (creditor !== undefined) updates.creditor = creditor
    if (description !== undefined) updates.description = description

    // Keep remainingAmount in sync with totalPaid when totalAmount changes
    if (totalAmount !== undefined) {
      const currentPaid = debt.totalPaid || 0
      updates.remainingAmount = Math.max(totalAmount - currentPaid, 0)
    }

    const updatedDebt = await Debt.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true })
    res.status(200).json(updatedDebt)
  } catch (error) {
    res.status(400).json({ message: 'Error updating debt', error: error.message })
  }
})

// DELETE /debts/:id - Delete a debt by ID
// Query parameter: userId (required) - to verify ownership
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    // Validate userId is provided
    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is required. Please provide userId as a query parameter.' 
      });
    }
    
    // Find the debt and verify it belongs to the user
    const debt = await Debt.findById(id);
    
    // Check if debt was found
    if (!debt) {
      return res.status(404).json({ message: 'Debt not found' });
    }
    
    // Verify the debt belongs to the user
    if (debt.userId !== userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this debt' });
    }
    
    // Delete the debt
    await Debt.findByIdAndDelete(id);
    
    // Return success message
    res.status(200).json({ message: 'Debt deleted successfully', debt });
  } catch (error) {
    // Handle invalid ID format or other errors
    res.status(500).json({ message: 'Error deleting debt', error: error.message });
  }
});

export default router;

