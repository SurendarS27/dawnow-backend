require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const staffRoutes = require('./src/routes/staff.routes');
const adminRoutes = require('./src/routes/admin.routes');
const questionRoutes = require('./src/routes/question.routes');
const reportRoutes = require('./src/routes/report.routes');

// New V2.0 Routes
const dailylogRoutes = require('./src/routes/dailylog.routes');
const goalRoutes = require('./src/routes/goal.routes');
const scoreRoutes = require('./src/routes/score.routes');
const documentRoutes = require('./src/routes/document.routes');
const noticeRoutes = require('./src/routes/notice.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');
const answerRoutes = require('./src/routes/answer.routes');
const projectRoutes = require('./src/routes/project.routes');

// Initialize express
const app = express();

// Static file serving for uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security middleware
// Security middleware - Configure Helmet to allow images and blobs
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "blob:", "http://localhost:5000", "http://localhost:5173", "http://localhost:5174"],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'https://jjcfrd.netlify.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs (increased from 100)
    message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to all routes except static files
app.use('/api/', limiter);

// More strict rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 requests per windowMs
    message: 'Too many authentication attempts, please try again later.'
});
app.use('/api/auth/', authLimiter);

// Health check (Public)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'DAW NOW API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/reports', reportRoutes);

// V2.0 Routes Mounting
app.use('/api/dailylog', dailylogRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/stats', require('./src/routes/adminStats.routes'));

// Backup & Recovery System
require('./src/backup/crashDetector').startCrashDetector();
require('./src/backup/scheduler').initMonthlyBackup();
require('./src/utils/autoApprover').initAutoApproval(); // 5:00 PM Auto-Approval Sync
app.use('/api', require('./src/routes/backupRoutes'));
app.use('/api', require('./src/backup/fallbackMode'));


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        // Create HTTP server
        const server = http.createServer(app);

        // Initialize Socket.IO
        const io = new Server(server, {
            cors: {
                origin: [
                    'http://localhost:5173',
                    'https://jjcfrd.netlify.app'
                ],
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        // Make io globally accessible
        global.io = io;

        // Socket.IO connection handler
        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            // Join room based on role
            socket.on('join', (role) => {
                socket.join(role);
                console.log(`Socket ${socket.id} joined room: ${role}`);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
            });
        });

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('Socket.IO is ready');
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
