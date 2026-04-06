const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const {
    getSummaryStats,
    getDailyLogActivity,
    getActivitiesByType,
    getProjectStatusStats,
    getMonthlySummary,
    getFacultyTable,
    getAnalyticalReport
} = require('../controllers/stats.controller');

// All stats routes are admin protected
router.get('/summary', protect, isAdmin, getSummaryStats);
router.get('/daily-logs', protect, isAdmin, getDailyLogActivity);
router.get('/activities-by-type', protect, isAdmin, getActivitiesByType);
router.get('/project-status', protect, isAdmin, getProjectStatusStats);
router.get('/monthly-summary', protect, isAdmin, getMonthlySummary);
router.get('/faculty-table', protect, isAdmin, getFacultyTable);
router.get('/analytical-report', protect, isAdmin, getAnalyticalReport);

module.exports = router;
