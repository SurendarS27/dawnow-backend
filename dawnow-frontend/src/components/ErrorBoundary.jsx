import React from 'react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        this.setState({
            error,
            errorInfo
        })
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
        window.location.reload()
    }

    handleGoHome = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
        window.location.href = '/login'
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h1>
                        <p className="text-gray-500 mb-6 text-sm">
                            We encountered an error loading this page. This has been logged and we'll look into it.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={this.handleReload}
                                className="flex-1 bg-primary-green text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-primary-green-dark transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Go to Login
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-6 text-left bg-gray-50 rounded-lg p-4 overflow-auto max-h-40">
                                <p className="text-xs text-red-500 font-mono break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
