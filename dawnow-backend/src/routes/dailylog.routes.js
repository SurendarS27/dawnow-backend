const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const { createOrUpdateLog, getMyLogs, getTodayLog, getStreak, getAllLogs } = require('../controllers/dailylog.controller');

router.use(protect);

router.post('/', createOrUpdateLog);
router.get('/', getMyLogs);
router.get('/today', getTodayLog);
router.get('/streak', getStreak);
router.get('/admin', isAdmin, getAllLogs);

module.exports = router;
