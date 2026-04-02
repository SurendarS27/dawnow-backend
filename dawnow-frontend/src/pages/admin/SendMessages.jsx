import { useState, useEffect } from 'react'
import API from '../../api/axios'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'

const SendMessages = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    const [formData, setFormData] = useState({
        sentTo: 'All Staff',
        priority: 'Normal',
        title: '',
        message: ''
    })

    const departments = ['All Staff', 'CSE', 'EEE', 'ECE', 'MECH', 'CIVIL', 'IT', 'MCA']
    const priorities = ['Normal', 'High', 'Urgent']

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const response = await API.get('/admin/notifications')
            setNotifications(response.data || [])
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.title || !formData.message) {
            toast.error('Please fill in all fields')
            return
        }

        setSending(true)
        try {
            await API.post('/admin/notifications', formData)
            toast.success('Message sent successfully!')
            setFormData({
                sentTo: 'All Staff',
                priority: 'Normal',
                title: '',
                message: ''
            })
            fetchNotifications()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message')
        } finally {
            setSending(false)
        }
    }

    const getPriorityBadge = (priority) => {
        const variants = {
            Normal: 'info',
            High: 'warning',
            Urgent: 'danger'
        }
        return <Badge variant={variants[priority]}>{priority}</Badge>
    }

    return (
        <div className="space-y-6">
            {/* Compose Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-heading font-semibold text-gray-800 mb-4">Compose Message</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Send To</label>
                            <select
                                value={formData.sentTo}
                                onChange={(e) => setFormData({ ...formData, sentTo: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="Enter message title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            rows={4}
                            placeholder="Enter your message..."
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={sending}
                            className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {sending ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Sent Messages History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-heading font-semibold text-gray-800">Sent Messages History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent To</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : notifications.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No messages sent yet</td>
                                </tr>
                            ) : (
                                notifications.map((notification, index) => (
                                    <tr key={notification._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm text-gray-800">{notification.title}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{notification.sentTo}</td>
                                        <td className="px-4 py-3">{getPriorityBadge(notification.priority)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default SendMessages
