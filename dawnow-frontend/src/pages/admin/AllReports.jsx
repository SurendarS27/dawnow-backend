import { useState, useEffect } from 'react'
import API from '../../api/axios'
import Badge from '../../components/ui/Badge'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { FileDown, Check, X, Search, Filter, FileText, Download, RefreshCw, Power } from 'lucide-react'
import toast from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import { settingsAPI } from '../../api'

const AllReports = () => {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [dept, setDept] = useState('')
    const [fromDate, setFromDate] = useState(null)
    const [toDate, setToDate] = useState(null)
    const [status, setStatus] = useState('')
    const [staffName, setStaffName] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [downloading, setDownloading] = useState(false)
    const [autoApprovalEnabled, setAutoApprovalEnabled] = useState(true)

    const departments = ['CSE', 'EEE', 'ECE', 'MECH', 'CIVIL', 'IT', 'MCA']

    const fetchTasks = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('page', page)
            params.append('limit', 10)
            if (dept) params.append('dept', dept)
            if (fromDate) params.append('from', fromDate.toISOString())
            if (toDate) params.append('to', toDate.toISOString())
            if (status) params.append('status', status)
            if (staffName) params.append('staffName', staffName)

            const response = await API.get(`/admin/tasks?${params}`)
            setTasks(response?.data?.tasks || [])
            setTotalPages(response?.data?.totalPages || 1)
        } catch (error) {
            console.error('Error fetching tasks:', error)
            toast.error('Failed to load reports')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [page, dept, fromDate, toDate, status])

    // Fetch auto-approval setting on mount
    useEffect(() => {
        const fetchAutoApprovalSetting = async () => {
            try {
                const response = await settingsAPI.getSetting('autoApprovalEnabled')
                // Default to true if value is null, undefined, or not set
                const settingValue = response.data.value
                setAutoApprovalEnabled(settingValue === undefined || settingValue === null ? true : settingValue)
            } catch (error) {
                console.error('Error fetching auto-approval setting:', error)
                // Default to true on error
                setAutoApprovalEnabled(true)
            }
        }
        fetchAutoApprovalSetting()
    }, [])

    const handleAutoApprovalToggle = async () => {
        try {
            const newValue = !autoApprovalEnabled
            await settingsAPI.setSetting('autoApprovalEnabled', newValue, 'Enable/disable automatic approval of reports submitted before 5 PM')
            setAutoApprovalEnabled(newValue)
            toast.success(newValue ? 'Auto Approval enabled' : 'Auto Approval disabled')
        } catch (error) {
            console.error('Error toggling auto-approval:', error)
            toast.error('Failed to update setting')
        }
    }

    const handleStatusUpdate = async (taskId, newStatus) => {
        try {
            await API.patch(`/admin/tasks/${taskId}/status`, { status: newStatus })
            toast.success(`Task ${newStatus} successfully`)
            fetchTasks()
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    // Generate PDF Report via Backend
    const handleDownloadPDF = async () => {
        setDownloading(true)
        try {
            const params = new URLSearchParams()
            if (dept) params.append('dept', dept)
            if (fromDate) params.append('from', fromDate.toISOString())
            if (toDate) params.append('to', toDate.toISOString())

            const response = await API.get(`/reports/pdf?${params}`, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `CFRD_Weekly_Report_${new Date().getTime()}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            toast.success('PDF downloaded successfully!')
        } catch (error) {
            console.error('PDF error:', error)
            toast.error('Failed to generate PDF')
        } finally {
            setDownloading(false)
        }
    }

    // Generate Excel Report via Backend
    const handleDownloadExcel = async () => {
        setDownloading(true)
        try {
            const params = new URLSearchParams()
            if (dept) params.append('dept', dept)
            if (fromDate) params.append('from', fromDate.toISOString())
            if (toDate) params.append('to', toDate.toISOString())

            const response = await API.get(`/reports/excel?${params}`, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `CFRD_Weekly_Report_${new Date().getTime()}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            toast.success('Excel downloaded successfully!')
        } catch (error) {
            console.error('Excel error:', error)
            toast.error('Failed to generate Excel')
        } finally {
            setDownloading(false)
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

    const handleSearch = (e) => {
        e.preventDefault()
        setPage(1)
        fetchTasks()
    }

    const handleClearFilters = () => {
        setDept('')
        setFromDate(null)
        setToDate(null)
        setStatus('')
        setStaffName('')
        setPage(1)
        setTimeout(() => fetchTasks(), 100)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-gray-800">Staff Reports</h1>
                    <p className="text-sm text-gray-500 mt-1">View and manage all staff research submissions</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 p-1 rounded-lg mr-4">
                        <button
                            onClick={() => {
                                const now = new Date();
                                const day = now.getDay();
                                const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                                const monday = new Date(now.setDate(diff));
                                monday.setHours(0, 0, 0, 0);
                                const saturday = new Date(monday);
                                saturday.setDate(monday.getDate() + 5);
                                saturday.setHours(23, 59, 59, 999);
                                setFromDate(monday);
                                setToDate(saturday);
                            }}
                            className="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-600"
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => {
                                const now = new Date();
                                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                                setFromDate(startOfMonth);
                                setToDate(endOfMonth);
                            }}
                            className="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-600"
                        >
                            This Month
                        </button>
                    </div>
                    <button
                        onClick={fetchTasks}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                    <button
                        onClick={handleAutoApprovalToggle}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            autoApprovalEnabled 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300' 
                                : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                        }`}
                        title={autoApprovalEnabled ? 'Auto Approval ON - Reports before 5 PM auto-approved' : 'Auto Approval OFF - All reports require manual approval'}
                    >
                        <Power size={18} className={autoApprovalEnabled ? 'animate-pulse' : ''} />
                        <span className="text-sm font-bold">
                            {autoApprovalEnabled ? '🟢 Auto Approval' : '🔴 Manual Only'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter size={18} className="text-gray-500" />
                        <span className="font-medium text-gray-700">Filters</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Staff Name</label>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={staffName}
                                    onChange={(e) => setStaffName(e.target.value)}
                                    placeholder="Search staff..."
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Department</label>
                            <select
                                value={dept}
                                onChange={(e) => setDept(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                            >
                                <option value="">All Departments</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">From Date</label>
                            <DatePicker
                                selected={fromDate}
                                onChange={setFromDate}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                                placeholderText="From"
                                dateFormat="dd/MM/yyyy"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">To Date</label>
                            <DatePicker
                                selected={toDate}
                                onChange={setToDate}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                                placeholderText="To"
                                dateFormat="dd/MM/yyyy"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Search
                            </button>
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                title="Clear filters"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </form>

                {/* Export Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
                    <span className="text-sm text-gray-500 flex items-center">
                        <FileText size={16} className="mr-2" />
                        Export Reports:
                    </span>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading || tasks.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                        <Download size={18} />
                        PDF
                    </button>
                    <button
                        onClick={handleDownloadExcel}
                        disabled={downloading || tasks.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        <Download size={18} />
                        Excel
                    </button>
                    {downloading && (
                        <span className="text-sm text-gray-500 flex items-center">
                            Generating...
                        </span>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dept</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Research Activity</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-green mb-3"></div>
                                            <p className="text-gray-500">Loading reports...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : tasks.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <FileText size={48} className="text-gray-300 mb-3" />
                                            <p className="text-gray-500">No reports found</p>
                                            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((task, index) => (
                                    <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-600">{(page - 1) * 10 + index + 1}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{task.staff?.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{task.staff?.department}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(task.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-800">
                                                    {task.paperTitle || task.projectName || task.patentTitle || task.bookTitle || task.activityTitle || 'Misc. Entry'}
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
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(task._id, 'approved')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Approve"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(task._id, 'rejected')}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Reject"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
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
                            Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, tasks.length)} of results
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum
                                    if (totalPages <= 5) {
                                        pageNum = i + 1
                                    } else if (page <= 3) {
                                        pageNum = i + 1
                                    } else if (page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i
                                    } else {
                                        pageNum = page - 2 + i
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-10 h-10 text-sm rounded-lg transition-colors ${page === pageNum
                                                    ? 'bg-primary-green text-white'
                                                    : 'border hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                })}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
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

export default AllReports
