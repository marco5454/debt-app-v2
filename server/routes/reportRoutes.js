import express from 'express'
import Report from '../models/Report.js'

const router = express.Router()

// Create a new report
router.post('/', async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      message,
      priority,
      category,
      suggestions,
      email
    } = req.body

    // Validate required fields - support both old and new structure
    const hasOldFormat = title && description
    const hasNewFormat = message
    
    if (!type || (!hasOldFormat && !hasNewFormat)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your feedback message'
      })
    }

    // Create report data - handle both old and new structures
    const reportData = {
      type,
      title: title || (message ? `${type.charAt(0).toUpperCase() + type.slice(1)} Feedback` : ''),
      description: description || message || '',
      priority: priority || 'medium',
      category: category || 'general',
      suggestions: suggestions || '',
      email: email || '',
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip || req.connection.remoteAddress
    }

    // Add userId if user is authenticated (optional)
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (token) {
      try {
        const { default: jwt } = await import('jsonwebtoken')
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123')
        reportData.userId = decoded.userId
      } catch (err) {
        // If token is invalid, continue without userId
        console.log('Invalid token provided, creating report without user ID')
      }
    }

    // Create and save the report
    const report = new Report(reportData)
    await report.save()

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        id: report._id,
        type: report.type,
        title: report.title,
        priority: report.priority,
        category: report.category,
        status: report.status,
        createdAt: report.createdAt
      }
    })

  } catch (error) {
    console.error('Error creating report:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Get all reports (admin endpoint)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      category
    } = req.query

    // Build filter object
    const filter = {}
    if (status) filter.status = status
    if (type) filter.type = type
    if (priority) filter.priority = priority
    if (category) filter.category = category

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Get reports with pagination
    const reports = await Report.find(filter)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)

    // Get total count for pagination
    const totalReports = await Report.countDocuments(filter)
    const totalPages = Math.ceil(totalReports / parseInt(limit))

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalReports,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    })

  } catch (error) {
    console.error('Error fetching reports:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Get report by ID
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('userId', 'username email')

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      })
    }

    res.json({
      success: true,
      data: report
    })

  } catch (error) {
    console.error('Error fetching report:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Update report status (admin endpoint)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    
    if (!['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      })
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    )

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      })
    }

    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: report
    })

  } catch (error) {
    console.error('Error updating report status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update report status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Delete report (admin endpoint)
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id)

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      })
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting report:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router