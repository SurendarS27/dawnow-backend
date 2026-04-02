import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (allowedRole && user?.role !== allowedRole) {
        // Redirect to their correct dashboard
        if (user?.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />
        }
        return <Navigate to="/staff/dashboard" replace />
    }

    return children
}

export default ProtectedRoute
