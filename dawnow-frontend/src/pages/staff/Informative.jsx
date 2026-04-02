import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import API from '../../api/axios'
import Badge from '../../components/ui/Badge'

const Informative = () => {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await API.get('/staff/notifications')
                setNotifications(response.data)
            } catch (error) {
                console.error('Error fetching notifications:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchNotifications()
    }, [])

    const handleMarkAsRead = async (id) => {
        try {
            await API.patch(`/staff/notifications/${id}/read`)
            setNotifications(prev =>
                prev.map(n =>
                    n._id === id
                        ? { ...n, readBy: [...(n.readBy || []), user?._id] }
                        : n
                )
            )
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    const isRead = (notification) => {
        return notification.readBy?.includes(user?._id)
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
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h1 className="text-2xl font-heading font-bold text-gray-800 mb-4">Informative Messages</h1>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No notifications</div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                onClick={() => !isRead(notification) && handleMarkAsRead(notification._id)}
                                className={`p-4 rounded-lg border transition-all cursor-pointer ${isRead(notification)
                                        ? 'bg-white border-gray-200'
                                        : 'bg-green-50 border-green-300 hover:border-green-400'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-gray-800">{notification.title}</h3>
                                            {getPriorityBadge(notification.priority)}
                                        </div>
                                        <p className="text-sm text-gray-600">{notification.message}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {new Date(notification.createdAt).toLocaleString()} • Sent to: {notification.sentTo}
                                        </p>
                                    </div>
                                    {!isRead(notification) && (
                                        <div className="w-3 h-3 bg-primary-green rounded-full flex-shrink-0 mt-1"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Informative
