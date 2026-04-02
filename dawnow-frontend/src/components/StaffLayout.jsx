import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import {
    LayoutDashboard,
    FileText,
    Eye,
    Clock,
    Bell,
    User,
    LogOut,
    Menu,
    X,
    ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import Header from './ui/Header'
import Footer from './Footer'
import { socket, connectSocket, disconnectSocket } from '../socket'

const StaffLayout = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)
    const [prevCount, setPrevCount] = useState(0)

    // Socket.IO real-time notification handler
    useEffect(() => {
        // Connect socket when component mounts
        connectSocket('staff')

        // Listen for new announcements
        const handleNewAnnouncement = (data) => {
            // Play notification sound
            playNotificationSound()

            // Update unread count
            setUnreadCount(prev => prev + 1)

            // Show toast notification
            toast.success(`${data.title}: ${data.message}`, {
                duration: 8000,
                icon: '🔔',
                style: {
                    background: '#16a34a',
                    color: '#fff',
                },
            })

            // Request browser notification permission if not granted
            if (Notification.permission === 'default') {
                Notification.requestPermission()
            }

            // Show browser notification if permitted
            if (Notification.permission === 'granted') {
                new Notification(data.title, {
                    body: data.message,
                    icon: '/images/jj-college-logo.png'
                })
            }
        }

        socket.on('new_announcement', handleNewAnnouncement)

        // Cleanup on unmount
        return () => {
            socket.off('new_announcement', handleNewAnnouncement)
            disconnectSocket()
        }
    }, [])

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await API.get('/staff/notifications/unread-count')
                const count = response?.data?.count || 0
                setUnreadCount(count)

                // Play sound if new notifications
                setPrevCount(prev => {
                    if (count > prev && prev > 0) {
                        playNotificationSound()
                    }
                    return count
                })
            } catch (error) {
                console.error('Error fetching unread count:', error)
            }
        }

        fetchUnreadCount()
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [])

    const playNotificationSound = () => {
        try {
            // Try using Web Audio API first
            const audioContext = new (window.AudioContext || window.webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            // Pleasant notification sound pattern
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime) // A5
            oscillator.frequency.setValueAtTime(1108, audioContext.currentTime + 0.1) // C#6
            oscillator.frequency.setValueAtTime(1318, audioContext.currentTime + 0.2) // E6
            oscillator.type = 'sine'
            gainNode.gain.value = 0.3

            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.3)
            audioContext.close()
        } catch (error) {
            // Fallback: try to use notification.mp3 if available
            try {
                const audio = new Audio('/notification.mp3')
                audio.volume = 0.5
                audio.play().catch(() => { })
            } catch (e) {
                console.log('Audio not supported')
            }
        }
    }

    const navItems = [
        { path: '/staff/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { path: '/staff/daily-log', icon: Clock, label: 'Daily Log' },
        { path: '/staff/task-entry', icon: FileText, label: 'Research Entry' },
        { path: '/staff/view-report', icon: Eye, label: 'History' },
        { path: '/staff/informative', icon: Bell, label: 'Notifications', badge: unreadCount },
        { path: '/staff/profile', icon: User, label: 'Profile' },
    ]

    const handleLogout = () => {
        disconnectSocket()
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-primary-green min-h-screen transition-all duration-300 fixed left-0 top-0 z-30`}
            >
                <div className="flex flex-col h-full">
                    {/* Toggle Button */}
                    <div className="h-20"></div> {/* Spacer for fixed header */}

                    {/* Toggle Button */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="absolute -right-3 top-20 bg-white rounded-full p-1 shadow-md"
                    >
                        {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
                    </button>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${isActive
                                        ? 'bg-green-800 text-white'
                                        : 'text-white/80 hover:bg-green-700'
                                    }`
                                }
                            >
                                <item.icon size={20} />
                                {sidebarOpen && (
                                    <>
                                        <span className="flex-1">{item.label}</span>
                                        {item.badge > 0 && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Info */}
                    <div className="p-4 border-t border-green-700">
                        {sidebarOpen ? (
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary-green font-bold">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                                    <p className="text-white/60 text-xs capitalize">{user?.role}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary-green font-bold mx-auto mb-3">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className={`flex items-center gap-2 text-white/80 hover:text-white hover:bg-green-700 w-full px-4 py-2 rounded-lg transition-colors ${sidebarOpen ? '' : 'justify-center'}`}
                        >
                            <LogOut size={18} />
                            {sidebarOpen && <span>Log Out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Header Component */}
            <Header />

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} pt-20`}>
                <div className="flex flex-col min-h-[calc(100vh-5rem)]">
                    {/* Page Content */}
                    <div className="p-6 flex-1">
                        <Outlet />
                    </div>
                    {/* Footer */}
                    <Footer />
                </div>
            </main>
        </div>
    )
}

export default StaffLayout
