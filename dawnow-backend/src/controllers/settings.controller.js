const Settings = require('../models/Settings');

// @desc    Get a setting by key
// @route   GET /api/settings/:key
// @access  Private (Admin)
const getSetting = async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: req.params.key });
        
        if (setting) {
            res.json({ key: setting.key, value: setting.value });
        } else {
            res.json({ key: req.params.key, value: null });
        }
    } catch (error) {
        console.error('[SETTINGS ERROR]', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Set a setting by key
// @route   POST /api/settings
// @access  Private (Admin)
const setSetting = async (req, res) => {
    try {
        const { key, value, description } = req.body;

        if (!key) {
            return res.status(400).json({ message: 'Setting key is required' });
        }

        let setting = await Settings.findOne({ key });

        if (setting) {
            setting.value = value;
            if (description !== undefined) setting.description = description;
            setting.updatedBy = req.user._id;
            await setting.save();
        } else {
            setting = await Settings.create({
                key,
                value,
                description,
                updatedBy: req.user._id
            });
        }

        res.json({ key: setting.key, value: setting.value });
    } catch (error) {
        console.error('[SETTINGS ERROR]', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private (Admin)
const getAllSettings = async (req, res) => {
    try {
        const settings = await Settings.find().select('key value description updatedAt');
        res.json(settings);
    } catch (error) {
        console.error('[SETTINGS ERROR]', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper to get auto approval setting (used by other modules)
const getAutoApprovalEnabled = async () => {
    try {
        const setting = await Settings.findOne({ key: 'autoApprovalEnabled' });
        return setting ? setting.value === true : true; // Default to true if not set
    } catch (error) {
        console.error('[GET AUTO APPROVAL ERROR]', error.message);
        return true; // Default to true on error
    }
};

module.exports = {
    getSetting,
    setSetting,
    getAllSettings,
    getAutoApprovalEnabled
};