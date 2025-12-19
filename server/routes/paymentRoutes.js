import express from 'express';
import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Debt from '../models/Debt.js';

const router = express.Router();

// Middleware to check MongoDB connection
const checkDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database not connected. Please check your MongoDB connection string in the .env file.',
      error: 'MongoDB connection failed',
    });
  }
  next();
};

router.use(checkDatabaseConnection);

// GET /payments?userId=...&debtId=...
router.get('/', async (req, res) => {
  try {
    const { userId, debtId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required. Please provide userId as a query parameter.' });
    }

    const query = { userId: String(userId) };
    if (debtId) {
      query.debtId = String(debtId);
    }

    const payments = await Payment.find(query).sort({ date: -1, createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
});

// POST /payments
router.post('/', async (req, res) => {
  try {
    const { userId, debtId, amount, method, date, note } = req.body;
    console.log('[POST /api/payments] body:', { userId, debtId, amount, method, date, hasNote: !!note });

    if (!userId || !debtId || amount === undefined) {
      return res.status(400).json({ message: 'Missing required fields: userId, debtId, and amount are required.' });
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be a positive number.' });
    }

    const payment = new Payment({
      userId: String(userId),
      debtId: String(debtId),
      amount: numericAmount,
      method: method || 'Other',
      date: date ? new Date(date) : Date.now(),
      note: note || '',
    });

    const saved = await payment.save();
    console.log('[POST /api/payments] saved payment id:', saved._id);

    // Recompute and persist totals on the Debt document
    // Get sum of all payments for this debt
    const agg = await Payment.aggregate([
      { $match: { userId: String(userId), debtId: String(debtId) } },
      { $group: { _id: null, totalPaid: { $sum: '$amount' } } }
    ]);
    const totalPaid = (agg[0]?.totalPaid) || 0;

    // Update debt summary fields without triggering full validation
    // This avoids failing on older debts that may miss required fields
    let debtUpdated = false;
    try {
      // We need debt.totalAmount to compute remaining. Fetch it safely first.
      const debtBasic = await Debt.findById(debtId).select('totalAmount').lean();
      if (debtBasic) {
        const remaining = Math.max((debtBasic.totalAmount || 0) - totalPaid, 0);
        const update = {
          totalPaid,
          remainingAmount: remaining,
          lastPaymentAmount: numericAmount,
          lastPaymentDate: date ? new Date(date) : new Date(),
        };
        await Debt.findByIdAndUpdate(debtId, { $set: update }, { new: true, runValidators: false });
        debtUpdated = true;
      }
    } catch (e) {
      console.warn('[POST /api/payments] debt summary update skipped:', e.message);
    }

    res.status(201).json({ payment: saved, debtUpdated });
  } catch (error) {
    console.error('[POST /api/payments] error:', error);
    res.status(400).json({ message: error.message || 'Error creating payment', error: error.message });
  }
});

export default router;
