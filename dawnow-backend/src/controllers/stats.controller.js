const DailyLog = require('../models/DailyLog');
const TaskEntry = require('../models/TaskEntry');
const User = require('../models/User');
const Document = require('../models/Document');

// @desc    Get dashboard summary stats
// @route   GET /api/stats/summary
// @access  Private (Admin)
const getSummaryStats = async (req, res) => {
    try {
        const totalFaculty = await User.countDocuments({ role: 'staff' });
        const activeProjects = await TaskEntry.countDocuments({ projectName: { $ne: '' }, status: 'approved' });
        
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);
        
        const reportsThisMonth = await TaskEntry.countDocuments({ 
            createdAt: { $gte: startOfMonth } 
        });

        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0,0,0,0);
        
        const logsThisWeek = await DailyLog.countDocuments({
            date: { $gte: startOfWeek }
        });

        res.json({
            totalFaculty,
            activeProjects,
            reportsThisMonth,
            logsThisWeek
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get daily log submission activity (Last 30 days)
// @route   GET /api/stats/daily-logs
const getDailyLogActivity = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activity = await DailyLog.aggregate([
            { $match: { date: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json(activity.map(item => ({ date: item._id, count: item.count })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get research activities by type
// @route   GET /api/stats/activities-by-type
const getActivitiesByType = async (req, res) => {
    try {
        const tasks = await TaskEntry.find({ status: 'approved' });
        
        const stats = {
            Paper: 0,
            Project: 0,
            Patent: 0,
            Book: 0,
            Activity: 0
        };

        tasks.forEach(task => {
            if (task.paperTitle) stats.Paper++;
            else if (task.projectName) stats.Project++;
            else if (task.patentTitle) stats.Patent++;
            else if (task.bookTitle) stats.Book++;
            else if (task.activityTitle) stats.Activity++;
        });

        const data = Object.keys(stats).map(name => ({ name, value: stats[name] }));
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get project status distribution
// @route   GET /api/stats/project-status
const getProjectStatusStats = async (req, res) => {
    try {
        const stats = await TaskEntry.aggregate([
            { $match: { projectName: { $ne: '' } } },
            { $group: { _id: "$projectStatus", count: { $sum: 1 } } }
        ]);

        const formatted = stats.map(s => ({
            name: s._id || 'Ongoing',
            value: s.count
        }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get monthly summary for current year
// @route   GET /api/stats/monthly-summary
const getMonthlySummary = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);

        const summary = await TaskEntry.aggregate([
            { $match: { date: { $gte: startOfYear }, status: 'approved' } },
            {
                $group: {
                    _id: { $month: "$date" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formatted = months.map((m, i) => {
            const found = summary.find(s => s._id === i + 1);
            return { month: m, count: found ? found.count : 0 };
        });

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get faculty-wise reporting table
// @route   GET /api/stats/faculty-table
const getFacultyTable = async (req, res) => {
    try {
        const faculty = await User.find({ role: 'staff' }).select('name department staffId lastLogin status');
        
        const data = await Promise.all(faculty.map(async (f) => {
            const logCount = await DailyLog.countDocuments({ staff: f._id });
            const reportCount = await TaskEntry.countDocuments({ staff: f._id });
            const lastLog = await DailyLog.findOne({ staff: f._id }).sort({ date: -1 }).select('date');
            
            return {
                name: f.name,
                department: f.department,
                staffId: f.staffId,
                logsSubmitted: logCount,
                reportsSubmitted: reportCount,
                lastActive: lastLog ? lastLog.date : f.lastLogin,
                status: f.status || 'active'
            };
        }));

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get counts for analytical report grid
// @route   GET /api/stats/analytical-report
const getAnalyticalReport = async (req, res) => {
    try {
        const tasks = await TaskEntry.find({ status: 'approved' });
        
        const report = {
            sci: { accepted: 0, published: 0 },
            scopus: { accepted: 0, published: 0 },
            conference: { accepted: 0, published: 0 },
            patent: { published: 0, grant: 0 },
            book: 0,
            funding: { applied: 0, received: 0 }
        };

        tasks.forEach(task => {
            // Paper checks
            if (task.paperTitle) {
                const type = (task.journalType || '').toLowerCase();
                const status = (task.paperStatus || '').toLowerCase();
                
                let target = null;
                if (type.includes('sci')) target = report.sci;
                else if (type.includes('scopus')) target = report.scopus;
                else if (type.includes('conference')) target = report.conference;

                if (target) {
                    if (status.includes('pub')) target.published++;
                    else if (status.includes('acc')) target.accepted++;
                }
            }
            
            // Patent checks
            if (task.patentTitle) {
                const status = (task.patentType || task.patentLevel || '').toLowerCase();
                if (status.includes('grant')) report.patent.grant++;
                else report.patent.published++;
            }

            // Book checks
            if (task.bookTitle) {
                report.book++;
            }

            // Project/Funding checks
            if (task.projectName) {
                const status = (task.projectStatus || '').toLowerCase();
                // Map 'Approved', 'Completed', 'In Progress' to Received if they imply funding
                // Map 'Submitted' to Applied
                if (status === 'submitted') {
                    report.funding.applied++;
                } else if (status === 'approved' || status === 'completed' || status === 'in progress') {
                    report.funding.received++;
                }
            }
        });

        res.json(report);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getSummaryStats,
    getDailyLogActivity,
    getActivitiesByType,
    getProjectStatusStats,
    getMonthlySummary,
    getFacultyTable,
    getAnalyticalReport
};
