import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import StaffLayout from './components/StaffLayout'
import AdminLayout from './components/AdminLayout'

// Lazy loaded components for better performance
const StaffDashboard = lazy(() => import('./pages/staff/Dashboard'))
const TaskEntry = lazy(() => import('./pages/staff/TaskEntry'))
const ViewReport = lazy(() => import('./pages/staff/ViewReport'))
const ChangePassword = lazy(() => import('./pages/staff/ChangePassword'))
const Informative = lazy(() => import('./pages/staff/Informative'))
const Profile = lazy(() => import('./pages/staff/Profile'))
const Success = lazy(() => import('./pages/staff/Success'))
const DailyLog = lazy(() => import('./pages/staff/DailyLog'))

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AllReports = lazy(() => import('./pages/admin/AllReports'))
const ManageStaff = lazy(() => import('./pages/admin/ManageStaff'))
const TaskQuestions = lazy(() => import('./pages/admin/TaskQuestions'))
const PwdRequests = lazy(() => import('./pages/admin/PwdRequests'))
const SendMessages = lazy(() => import('./pages/admin/SendMessages'))
const Analytics = lazy(() => import('./pages/admin/Analytics'))
const DocumentVerification = lazy(() => import('./pages/admin/DocumentVerification'))
const SubmitProject = lazy(() => import('./pages/admin/SubmitProject'))
const AllProjects = lazy(() => import('./pages/admin/AllProjects'))
const FundingReport = lazy(() => import('./pages/admin/FundingReport'))
const BackupDashboard = lazy(() => import('./pages/admin/BackupDashboard'))

// Loading fallback component
const LoadingFallback = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-green mb-4"></div>
            <p className="text-gray-500">Loading...</p>
        </div>
    </div>
)

function App() {
    const { loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-green/5 to-green-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-green mb-4 shadow-lg"></div>
                    <p className="text-gray-600 font-medium">Loading JJCET CFRD...</p>
                </div>
            </div>
        )
    }

    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Staff Routes */}
                <Route path="/staff" element={
                    <ProtectedRoute allowedRole="staff">
                        <StaffLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="/staff/dashboard" replace />} />
                    <Route path="dashboard" element={<StaffDashboard />} />
                    <Route path="daily-log" element={<DailyLog />} />
                    <Route path="task-entry" element={<TaskEntry />} />
                    <Route path="view-report" element={<ViewReport />} />
                    <Route path="change-password" element={<ChangePassword />} />
                    <Route path="informative" element={<Informative />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="success" element={<Success />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRole="admin">
                        <AdminLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="reports" element={<AllReports />} />
                    <Route path="verification" element={<DocumentVerification />} />
                    <Route path="staff" element={<ManageStaff />} />
                    <Route path="questions" element={<TaskQuestions />} />
                    <Route path="pwd-requests" element={<PwdRequests />} />
                    <Route path="messages" element={<SendMessages />} />

                    {/* College Project Management Routes */}
                    <Route path="submit-project" element={<SubmitProject />} />
                    <Route path="projects" element={<AllProjects />} />
                    <Route path="funding-report" element={<FundingReport />} />
                    <Route path="backup" element={<BackupDashboard />} />
                </Route>

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Suspense>
    )
}

export default App
