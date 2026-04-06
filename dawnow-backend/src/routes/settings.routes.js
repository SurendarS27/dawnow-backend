const express = require('express');
const router = express.Router();
const { getSetting, setSetting, getAllSettings } = require('../controllers/settings.controller');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/:key', protect, isAdmin, getSetting);
router.post('/', protect, isAdmin, setSetting);
router.get('/', protect, isAdmin, getAllSettings);

module.exports = router;