import { useNavigate } from 'react-router-dom'

const NotFound = () => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
            <div className="text-center">
                <h1 className="text-8xl font-bold text-gray-300 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    The page you are looking for does not exist or you don't have access.
                </p>
                <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 bg-primary-green text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md"
                >
                    Go to Login
                </button>
            </div>
        </div>
    )
}

export default NotFound
