import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'
import toast from 'react-hot-toast'
import { User, Mail, Lock, Camera, Save } from 'lucide-react'

const AdminProfile = () => {
    const { user, updateProfile } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [updating, setUpdating] = useState(false)
    const [avatarLoading, setAvatarLoading] = useState(false)

    const infoFields = [
        { label: 'Full Name', value: user?.name, icon: User },
        { label: 'Email', value: user?.email, icon: Mail },
        { label: 'Username', value: user?.username, icon: User },
        { label: 'Role', value: user?.role, icon: User },
    ]

    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB')
            return
        }

        const formData = new FormData()
        formData.append('profileImage', file)
        
        setAvatarLoading(true)
        try {
            const res = await updateProfile(formData)
            if (res.success) {
                toast.success('Profile image updated!')
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error('Failed to upload image')
        } finally {
            setAvatarLoading(false)
        }
    }

    const getProfileImageUrl = (imagePath) => {
        if (!imagePath) return null
        if (imagePath.startsWith('http')) return imagePath
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '') + '/'
        return `${baseUrl}${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}`
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setUpdating(true)
        try {
            await API.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })
            toast.success('Password changed successfully!')
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password')
        } finally {
            setUpdating(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <h1 className="text-2xl font-heading font-bold text-gray-800 mb-6">Admin Profile</h1>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            {user?.profileImage ? (
                                <img 
                                    src={getProfileImageUrl(user.profileImage)} 
                                    alt={user.name} 
                                    className={`w-32 h-32 rounded-full object-cover shadow-lg border-2 border-primary-green transition-opacity ${avatarLoading ? 'opacity-50' : ''}`}
                                />
                            ) : (
                                <div className={`w-32 h-32 bg-gradient-to-br from-primary-green to-green-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg ${avatarLoading ? 'animate-pulse' : ''}`}>
                                    {user?.name?.charAt(0) || 'A'}
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-primary-green transition-colors cursor-pointer border border-gray-100">
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                <Camera size={18} />
                            </label>
                            {avatarLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-primary-green border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        <p className="mt-4 text-lg font-semibold text-gray-800">{user?.name}</p>
                        <span className="px-3 py-1 bg-primary-green/10 text-primary-green rounded-full text-sm font-medium capitalize">
                            {user?.role}
                        </span>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {infoFields.map((field, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-green/10 rounded-lg flex items-center justify-center">
                                        <field.icon size={18} className="text-primary-green" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">{field.label}</p>
                                        <p className="font-medium text-gray-800">{field.value || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Lock size={18} className="text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-heading font-semibold text-gray-800">Change Admin Password</h2>
                        <p className="text-sm text-gray-500">Update your password to keep the platform secure</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                                    placeholder="Enter new password"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                                    placeholder="Confirm new password"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                                className="w-4 h-4 text-primary-green rounded"
                            />
                            <span className="text-sm text-gray-600">Show passwords</span>
                        </label>

                        <button
                            type="submit"
                            disabled={updating}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary-green text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg"
                        >
                            <Save size={18} />
                            {updating ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AdminProfile
