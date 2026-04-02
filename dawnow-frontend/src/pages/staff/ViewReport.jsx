import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axios'
import Badge from '../../components/ui/Badge'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const ViewReport = () => {
    const navigate = useNavigate()
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [fromDate, setFromDate] = useState(null)
    const [toDate, setToDate] = useState(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const fetchTasks = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('page', page)
            params.append('limit', 10)
            if (fromDate) params.append('from', fromDate.toISOString())
            if (toDate) params.append('to', toDate.toISOString())

            const response = await API.get(`/staff/tasks?${params}`)
            setTasks(response?.data?.tasks || [])
            setTotalPages(response?.data?.totalPages || 1)
        } catch (error) {
            console.error('Error fetching tasks:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [page, fromDate, toDate])

    const handleEdit = (task) => {
        navigate('/staff/task-entry', { state: { editTaskId: task._id } })
    }

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'pending',
            approved: 'approved',
            rejected: 'rejected'
        }
        return <Badge variant={variants[status]}>{status}</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h1 className="text-2xl font-heading font-bold text-gray-800 mb-4">View Reports</h1>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">From Date</label>
                        <DatePicker
                            selected={fromDate}
                            onChange={setFromDate}
                            selectsStart
                            startDate={fromDate}
                            endDate={toDate}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                            placeholderText="From"
                            dateFormat="dd/MM/yyyy"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">To Date</label>
                        <DatePicker
                            selected={toDate}
                            onChange={setToDate}
                            selectsEnd
                            startDate={fromDate}
                            endDate={toDate}
                            minDate={fromDate}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                            placeholderText="To"
                            dateFormat="dd/MM/yyyy"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => { setFromDate(null); setToDate(null) }}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Research Activity</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : tasks.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No tasks found</td>
                                </tr>
                            ) : (
                                tasks.map((task, index) => (
                                    <tr key={task._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-600">{(page - 1) * 10 + index + 1}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(task.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-800">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">
                                                    {task.paperTitle || task.projectName || task.patentTitle || task.bookTitle || task.activityTitle || 'Research Entry'}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    {task.paperTitle ? 'Paper' : 
                                                     task.projectName ? 'Project' : 
                                                     task.patentTitle ? 'Patent' : 
                                                     task.bookTitle ? 'Book' : 
                                                     task.activityTitle ? 'Activity' : 'General'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{getStatusBadge(task.status)}</td>
                                        <td className="px-4 py-3">
                                            {task.status === 'pending' && (
                                                <button
                                                    onClick={() => handleEdit(task)}
                                                    className="text-primary-green hover:underline text-sm"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}

export default ViewReport
