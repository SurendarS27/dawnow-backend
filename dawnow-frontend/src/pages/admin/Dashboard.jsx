import { useState, useEffect } from 'react'
import API from '../../api/axios'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import {
    Users,
    FileText,
    Clock,
    Key,
    Award,
    BookOpen,
    Lightbulb,
    TrendingUp,
    Calendar
} from 'lucide-react'
import BannerBox from '../../components/ui/BannerBox'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStaff: 0,
        reportsThisMonth: 0,
        pendingApprovals: 0,
        pendingPwdRequests: 0,
        recentActivity: [],
        // New analytics fields
        totalPapers: 0,
        totalProjects: 0,
        totalPatents: 0,
        totalBooks: 0,
        totalActivities: 0
    })
    const [loading, setLoading] = useState(true)
    const [departmentData, setDepartmentData] = useState([])
    const [monthlyData, setMonthlyData] = useState([])
    const [activityData, setActivityData] = useState([])

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await API.get('/admin/dashboard')
                const data = response.data || {}

                setStats({
                    totalStaff: data.totalStaff || 0,
                    reportsThisMonth: data.reportsThisMonth || 0,
                    pendingApprovals: data.pendingApprovals || 0,
                    pendingPwdRequests: data.pendingPwdRequests || 0,
                    recentActivity: data.recentActivity || [],
                    totalPapers: data.totalPapers || 0,
                    totalProjects: data.totalProjects || 0,
                    totalPatents: data.totalPatents || 0,
                    totalBooks: data.totalBooks || 0,
                    totalActivities: data.totalActivities || 0
                })

                // Set chart data if available
                if (data.departmentStats) setDepartmentData(data.departmentStats)
                if (data.monthlyStats) setMonthlyData(data.monthlyStats)
                if (data.activityDistribution) setActivityData(data.activityDistribution)
            } catch (error) {
                console.error('Error fetching dashboard:', error)
                // Set demo data for visualization
                setDepartmentData([
                    { name: 'CSE', papers: 45, projects: 12, patents: 5 },
                    { name: 'ECE', papers: 38, projects: 8, patents: 3 },
                    { name: 'EEE', papers: 28, projects: 15, patents: 2 },
                    { name: 'MECH', papers: 22, projects: 10, patents: 4 },
                    { name: 'CIVIL', papers: 18, projects: 6, patents: 1 },
                    { name: 'IT', papers: 35, projects: 9, patents: 6 }
                ])
                setMonthlyData([
                    { month: 'Jul', submissions: 45 },
                    { month: 'Aug', submissions: 52 },
                    { month: 'Sep', submissions: 48 },
                    { month: 'Oct', submissions: 65 },
                    { month: 'Nov', submissions: 72 },
                    { month: 'Dec', submissions: 58 },
                    { month: 'Jan', submissions: 80 },
                    { month: 'Feb', submissions: 85 },
                    { month: 'Mar', submissions: 92 }
                ])
                setActivityData([
                    { name: 'Papers', value: 186, color: '#3b82f6' },
                    { name: 'Projects', value: 60, color: '#22c55e' },
                    { name: 'Patents', value: 21, color: '#f59e0b' },
                    { name: 'Books', value: 15, color: '#8b5cf6' },
                    { name: 'Activities', value: 120, color: '#ef4444' }
                ])
            } finally {
                setLoading(false)
            }
        }

        fetchDashboard()
    }, [])

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
            <BannerBox />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Staff"
                    value={stats.totalStaff}
                    icon={Users}
                    color="green"
                />
                <StatCard
                    title="Reports This Month"
                    value={stats.reportsThisMonth}
                    icon={FileText}
                    color="blue"
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats.pendingApprovals}
                    icon={Clock}
                    color="amber"
                />
                <StatCard
                    title="Pending Pwd Requests"
                    value={stats.pendingPwdRequests}
                    icon={Key}
                    color="red"
                />
            </div>

            {/* Research Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Papers</p>
                            <p className="text-3xl font-bold mt-1">{stats.totalPapers}</p>
                        </div>
                        <FileText size={32} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Projects</p>
                            <p className="text-3xl font-bold mt-1">{stats.totalProjects}</p>
                        </div>
                        <Award size={32} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-100 text-sm">Patents</p>
                            <p className="text-3xl font-bold mt-1">{stats.totalPatents}</p>
                        </div>
                        <Lightbulb size={32} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Books</p>
                            <p className="text-3xl font-bold mt-1">{stats.totalBooks}</p>
                        </div>
                        <BookOpen size={32} className="opacity-80" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-pink-100 text-sm">Activities</p>
                            <p className="text-3xl font-bold mt-1">{stats.totalActivities}</p>
                        </div>
                        <Users size={32} className="opacity-80" />
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart - Department Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-heading font-semibold text-gray-800 flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary-green" />
                            Research by Department
                        </h3>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={departmentData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="papers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="projects" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart - Activity Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-heading font-semibold text-gray-800 flex items-center gap-2">
                            <Calendar size={20} className="text-primary-green" />
                            Activity Distribution
                        </h3>
                    </div>
                    <div className="h-72 flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={activityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {activityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Line Chart - Monthly Submissions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-heading font-semibold text-gray-800 flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary-green" />
                        Monthly Submission Trend
                    </h3>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="submissions"
                                stroke="#22c55e"
                                strokeWidth={3}
                                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-heading font-semibold text-gray-800">Recent Activity</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-green"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : stats.recentActivity.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <FileText size={48} className="text-gray-300 mb-2" />
                                            <p>No recent activity found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                stats.recentActivity.map((activity, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-600">{activity.staffName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{activity.department}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{activity.action}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(activity.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">{getStatusBadge(activity.status)}</td>
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

export default AdminDashboard
