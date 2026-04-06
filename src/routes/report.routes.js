const express = require('express');
const router = express.Router();
const { generatePDF, generateExcel, generateAnalyticsPDF } = require('../controllers/report.controller');
const { protect, isAdmin } = require('../middleware/auth');

// Authentication required for all report routes
router.use(protect);

router.get('/pdf', generatePDF);
router.get('/excel', generateExcel);

// Detailed Analytics is Admin only
router.get('/analytics-pdf', isAdmin, generateAnalyticsPDF);

module.exports = router;
