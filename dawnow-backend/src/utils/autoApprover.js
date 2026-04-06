const cron = require('node-cron');
const TaskEntry = require('../models/TaskEntry');
const User = require('../models/User');
const { calculateTaskScore } = require('./scoreCalculator');
const logger = require('../backup/logger');

/**
 * Automatically approves all 'pending' reports every day at 5:00 PM (17:00)
 */
const initAutoApproval = () => {
    // Schedule: 0 minutes, 17 hour (5 PM), every day, every month, every day of week
    cron.schedule('0 17 * * *', async () => {
        logger.info('--- Starting Daily Auto-Approval Sync (5:00 PM) ---');
        
        try {
            // Find all pending tasks
            const pendingTasks = await TaskEntry.find({ status: 'pending' });
            
            if (pendingTasks.length === 0) {
                logger.info('Auto-Approval: No pending tasks found at 5:00 PM.');
                return;
            }

            logger.info(`Auto-Approval: Found ${pendingTasks.length} pending reports to finalize.`);

            for (const task of pendingTasks) {
                // Update Task Status
                task.status = 'approved';
                task.adminNote = 'Auto-approved by system (Daily 5:00 PM Sync)';
                await task.save();

                // Update Staff Score
                const user = await User.findById(task.staff);
                if (user) {
                    const taskScore = await calculateTaskScore(task);
                    user.totalScore += taskScore;
                    await user.save();
                    logger.info(`[Auto-Approve] Task for ${user.name} approved. Points added: ${taskScore}`);
                }
            }

            logger.info('--- Daily Auto-Approval Sync Completed ---');
            
            // Notify via Socket.io if available (optional)
            if (global.io) {
                global.io.emit('notification', {
                    message: `Daily Sync: ${pendingTasks.length} reports auto-approved.`,
                    type: 'success'
                });
            }

        } catch (error) {
            logger.error(`Auto-Approval Error: ${error.message}`);
        }
    }, {
        timezone: "Asia/Kolkata" // Setting to your local time zone (IST)
    });

    logger.info('Auto-Approval scheduler initialized for 5:00 PM (IST).');
};

module.exports = { initAutoApproval };
