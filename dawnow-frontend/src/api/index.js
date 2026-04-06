import API from './axios'

// ============ QUESTIONS API ============
export const questionAPI = {
    // Get active questions for staff (grouped by section)
    getActive: () => API.get('/questions'),

    // Get questions by section
    getBySection: (section) => API.get(`/questions/section/${section}`),

    // Admin: Get all questions
    getAll: () => API.get('/questions/all'),

    // Admin: Create question
    create: (data) => API.post('/questions', data),

    // Admin: Update question
    update: (id, data) => API.put(`/questions/${id}`, data),

    // Admin: Toggle question active status
    toggle: (id) => API.patch(`/questions/${id}/toggle`),

    // Admin: Delete question
    delete: (id) => API.delete(`/questions/${id}`),

    // Admin: Reorder questions
    reorder: (questions) => API.put('/questions/reorder', { questions })
}

// ============ ANSWERS API ============
export const answerAPI = {
    // Submit answers for a date
    submit: (data) => API.post('/answers', data),

    // Get answers for current user by date
    getByDate: (date) => API.get(`/answers/${date}`),

    // Admin: Get all answers
    getAll: (params) => API.get('/answers/all/by-date', { params }),

    // Admin: Get answers by user
    getByUser: (userId) => API.get(`/answers/user/${userId}`),

    // Admin: Get answer summary/analytics
    getSummary: (params) => API.get('/answers/summary/stats', { params }),

    // Delete answer
    delete: (id) => API.delete(`/answers/${id}`)
}

// ============ DAILY LOG API ============
export const dailyLogAPI = {
    getByDate: (date) => API.get(`/dailylog/${date}`),
    getByDateRange: (startDate, endDate) => API.get(`/dailylog/range`, {
        params: { startDate, endDate }
    }),
    create: (data) => API.post('/dailylog', data),
    update: (id, data) => API.put(`/dailylog/${id}`, data),
    getStats: () => API.get('/dailylog/stats'),
    getByUser: (userId) => API.get(`/dailylog/user/${userId}`),
    getByUserAndDate: (userId, date) => API.get(`/dailylog/user/${userId}/date/${date}`),
    getAllAdmin: (params) => API.get('/dailylog/admin', { params })
}

// ============ GOALS API ============
export const goalAPI = {
    getMyGoals: () => API.get('/goals/my'),
    create: (data) => API.post('/goals', data),
    update: (id, data) => API.put(`/goals/${id}`, data),
    delete: (id) => API.delete(`/goals/${id}`),
    updateProgress: (id, data) => API.patch(`/goals/${id}/progress`, data),
    getAll: () => API.get('/goals'),
    getByUser: (userId) => API.get(`/goals/user/${userId}`)
}

// ============ TASKS API ============
export const taskAPI = {
    getMyTasks: () => API.get('/staff/tasks'),
    getByDate: (date) => API.get(`/staff/tasks/date/${date}`),
    getById: (id) => API.get(`/staff/tasks/${id}`),
    create: (data) => API.post('/staff/tasks', data),
    update: (id, data) => API.put(`/staff/tasks/${id}`, data),
    delete: (id) => API.delete(`/staff/tasks/${id}`),
    submitEntry: (taskId, data) => API.post(`/staff/tasks/${taskId}/entry`, data),
    getEntries: (taskId) => API.get(`/staff/tasks/${taskId}/entries`),
    getEntryByDate: (taskId, date) => API.get(`/staff/tasks/${taskId}/entries/${date}`)
}

// ============ REPORTS API ============
export const reportAPI = {
    getMyReports: () => API.get('/reports/my'),
    create: (data) => API.post('/reports', data),
    getByDate: (date) => API.get(`/reports/date/${date}`),
    getByDateRange: (startDate, endDate) => API.get(`/reports/range`, {
        params: { startDate, endDate }
    }),
    getAll: () => API.get('/reports'),
    update: (id, data) => API.put(`/reports/${id}`, data),
    getByUser: (userId) => API.get(`/reports/user/${userId}`)
}

// ============ ANALYTICS API ============
export const analyticsAPI = {
    getOverview: () => API.get('/analytics/overview'),
    getDepartmentStats: () => API.get('/analytics/department-stats'),
    getUserStats: (userId) => API.get(`/analytics/user-stats/${userId}`),
    getActivityTimeline: () => API.get('/analytics/activity-timeline'),
    getScoreDistribution: () => API.get('/analytics/score-distribution'),
    getCompletionRates: () => API.get('/analytics/completion-rates')
}

// ============ SCORE API ============
export const scoreAPI = {
    getMyScore: () => API.get('/score/my'),
    getScoreHistory: () => API.get('/score/history'),
    getRules: () => API.get('/score/rules'),
    getLeaderboard: () => API.get('/score/leaderboard'),
    getAllScores: () => API.get('/score/all')
}

// ============ NOTICES API ============
export const noticeAPI = {
    getActive: () => API.get('/notices/active'),
    getAll: () => API.get('/notices'),
    create: (data) => API.post('/notices', data),
    update: (id, data) => API.put(`/notices/${id}`, data),
    delete: (id) => API.delete(`/notices/${id}`)
}

// ============ DOCUMENTS API ============
export const documentAPI = {
    getMyDocuments: () => API.get('/documents/my'),
    upload: (formData) => API.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => API.put(`/documents/${id}`, data),
    delete: (id) => API.delete(`/documents/${id}`),
    verify: (id, status) => API.patch(`/documents/${id}/verify`, { status }),
    getPending: () => API.get('/documents/pending')
}

// ============ ADMIN API ============
export const adminAPI = {
    // Users
    getUsers: () => API.get('/admin/users'),
    getUser: (id) => API.get(`/admin/users/${id}`),
    createUser: (data) => API.post('/admin/users', data),
    updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
    deleteUser: (id) => API.delete(`/admin/users/${id}`),

    // Staff Management
    getStaff: () => API.get('/admin/staff'),
    updateStaff: (id, data) => API.put(`/admin/staff/${id}`, data),

    // Notifications
    createNotification: (data) => API.post('/admin/notifications', data),
    getNotifications: () => API.get('/admin/notifications'),

    // Reports
    getAllReports: () => API.get('/admin/reports'),
    getReportStats: () => API.get('/admin/report-stats'),

    // PWD Requests
    getPwdRequests: () => API.get('/admin/pwd-requests'),
    updatePwdRequest: (id, data) => API.patch(`/admin/pwd-requests/${id}`, data),

    // Analytics
    getAnalytics: () => API.get('/admin/analytics'),
    getDepartmentAnalytics: () => API.get('/admin/department-analytics'),

    // Awards
    getAwards: () => API.get('/admin/awards'),
    createAward: (data) => API.post('/admin/awards', data),
    updateAward: (id, data) => API.put(`/admin/awards/${id}`, data),

    // Leave Management
    getLeaveRequests: () => API.get('/admin/leave'),
    updateLeave: (id, data) => API.patch(`/admin/leave/${id}`, data)
}

// ============ PROJECTS API ============
export const projectAPI = {
    getAll: (params) => API.get('/projects', { params }),
    getById: (id) => API.get(`/projects/${id}`),
    create: (data) => API.post('/projects', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => API.put(`/projects/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => API.delete(`/projects/${id}`),
    getReport: () => API.get('/projects/report')
}

// ============ AUTH API ============
export const authAPI = {
    login: (credentials) => API.post('/auth/login', credentials),
    register: (data) => API.post('/auth/register', data),
    logout: () => API.post('/auth/logout'),
    getProfile: () => API.get('/auth/profile'),
    updateProfile: (data) => API.put('/auth/profile', data),
    changePassword: (data) => API.post('/auth/change-password', data),
    forgotPassword: (email) => API.post('/auth/forgot-password', email),
    resetPassword: (token, data) => API.post(`/auth/reset-password/${token}`, data)
}

// ============ SETTINGS API ============
export const settingsAPI = {
    getSetting: (key) => API.get(`/settings/${key}`),
    setSetting: (key, value, description) => API.post('/settings', { key, value, description }),
    getAll: () => API.get('/settings')
}
