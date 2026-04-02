import { useState, useEffect } from 'react'
import API from '../../api/axios'
import toast from 'react-hot-toast'
import Badge from '../../components/ui/Badge'

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [requestStatus, setRequestStatus] = useState(null)

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await API.get('/staff/pwd-request')
                setRequestStatus(response.data)
            } catch (error) {
                console.error('Error fetching request status:', error)
            }
        }

        fetchStatus()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill in all fields')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        try {
            const response = await API.post('/staff/pwd-request', {
                oldPassword: currentPassword,
                newPassword
            })
            toast.success(response.data.message)

            // Refresh status
            const statusResponse = await API.get('/staff/pwd-request')
            setRequestStatus(statusResponse.data)

            // Clear form
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit request')
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            approved: 'success',
            rejected: 'danger'
        }
        return <Badge variant={variants[status]}>{status}</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h1 className="text-2xl font-heading font-bold text-gray-800 mb-4">Change Password</h1>

                {/* Request Status */}
                {requestStatus?.hasRequest && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-blue-800">Password Change Request Status</p>
                                <p className="text-sm text-blue-600 mt-1">
                                    Request sent on: {new Date(requestStatus.createdAt).toLocaleString()}
                                </p>
                            </div>
                            {getStatusBadge(requestStatus.status)}
                        </div>
                        {requestStatus.adminNote && (
                            <p className="text-sm text-blue-700 mt-2">
                                Admin Note: {requestStatus.adminNote}
                            </p>
                        )}
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-green-800">
                        <strong>Note:</strong> Password change requests require admin approval.
                        Your request will be sent to the administrator for review.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                            placeholder="Enter current password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                            placeholder="Enter new password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || requestStatus?.status === 'pending'}
                        className="w-full bg-primary-green text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ChangePassword
