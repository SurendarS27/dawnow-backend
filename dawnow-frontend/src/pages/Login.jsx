import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import Footer from '../components/Footer'

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!username || !password) {
            toast.error('Please enter username and password')
            return
        }

        setLoading(true)
        const result = await login(username, password)
        setLoading(false)

        if (result.success) {
            toast.success('Login successful!')
            // Redirect based on role
            navigate(result.user?.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard')
        } else {
            toast.error(result.message || 'Login failed')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-green to-green-800 flex flex-col items-center justify-center p-6 space-y-8">
            {/* Header Section (Wider) */}
            <div className="w-full max-w-2xl text-center">
                <div className="bg-white rounded-2xl p-2 shadow-2xl mb-4 mx-auto w-fit max-w-full overflow-hidden">
                    <img
                        src="/images/logo-jjcet.jpg"
                        alt="JJCET Logo"
                        className="h-32 w-auto object-contain"
                    />
                </div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">JJCET CFRD LOGIN PAGE</h1>
                <p className="text-white/80 text-lg">Centre for Research & Development</p>
                <p className="text-white/60 text-sm">JJ College of Engineering & Technology</p>
            </div>

            {/* Form Section (Focused) */}
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-xl font-heading font-semibold text-gray-800 text-center mb-6">
                        Sign In
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-all"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-green hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
                <Footer />
            </div>
        </div>
    )
}

export default Login
