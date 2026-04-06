import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axios'
import Badge from '../../components/ui/Badge'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { jsPDF } from 'jspdf'
import toast from 'react-hot-toast'
import { Download, FileText, Calendar, Eye, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const ViewReport = () => {
    const { user } = useAuth()
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
            toast.error('Failed to load reports')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadPDF = (task) => {
        try {
            const doc = new jsPDF()
            const pageWidth = doc.internal.pageSize.getWidth()
            const pageHeight = doc.internal.pageSize.getHeight()
            const margin = 20
            const contentWidth = pageWidth - (margin * 2)
            
            const pageHeader = 'JJCET - CENTRE FOR RESEARCH & DEVELOPMENT'
            const title = 'Research Activity Report'
            
            const cleanText = (text) => {
                if (!text || typeof text !== 'string') return text;
                return text.replace(/[^\x20-\x7E\n\r\t]/g, '');
            };

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(14)
            doc.setTextColor(31, 41, 55)
            doc.text(pageHeader, pageWidth / 2, 15, { align: 'center' })
            
            doc.setFontSize(12)
            doc.text(title, pageWidth / 2, 22, { align: 'center' })
            
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(10)
            doc.setDrawColor(229, 231, 235)
            doc.line(margin, 26, pageWidth - margin, 26)
            
            doc.setTextColor(75, 85, 99)
            doc.text(`Staff Name: ${user?.name || 'N/A'}`, margin, 35)
            doc.text(`Department: ${user?.department || 'N/A'}`, margin, 42)
            doc.text(`Report Date: ${new Date(task.date).toLocaleDateString()}`, margin, 49)
            doc.text(`Submission ID: ${task._id}`, margin, 56)
            
            let y = 70
            const lineHeight = 7
            
            const checkPageBreak = (neededHeight) => {
                if (y + neededHeight > pageHeight - 20) {
                    doc.addPage()
                    y = 25
                    return true
                }
                return false
            }
            
            const renderField = (label, value) => {
                const cleanedValue = cleanText(value);
                if (!cleanedValue || cleanedValue === '' || cleanedValue === 'N/A') return
                doc.setFont('helvetica', 'bold')
                const labelWidth = doc.getTextWidth(`${label}: `)
                doc.setFont('helvetica', 'normal')
                const splitValue = doc.splitTextToSize(String(cleanedValue), contentWidth - labelWidth - 10)
                const blockHeight = splitValue.length * lineHeight
                checkPageBreak(blockHeight + 4)
                doc.setFont('helvetica', 'bold')
                doc.text(`${label}: `, margin + 5, y)
                doc.setFont('helvetica', 'normal')
                doc.text(splitValue, margin + 5 + labelWidth, y)
                y += blockHeight + 4
            }

            const renderSection = (header) => {
                checkPageBreak(15)
                doc.setFont('helvetica', 'bold')
                doc.setFillColor(243, 244, 246)
                doc.rect(margin, y - 6, contentWidth, 9, 'F')
                doc.setTextColor(17, 24, 39)
                doc.text(header, margin + 5, y)
                doc.setFont('helvetica', 'normal')
                doc.setTextColor(55, 65, 81)
                y += 12
            }

            if (task.paperTitle) {
                renderSection('PAPER DETAILS')
                renderField('Paper Title', task.paperTitle)
                renderField('Status', task.paperStatus)
                renderField('Journal', task.journalName)
                renderField('Type', task.journalType)
            } else if (task.projectName) {
                renderSection('PROJECT DETAILS')
                renderField('Project Name', task.projectName)
                renderField('Funding Agency', task.fundingAgency)
                renderField('Amount', task.fundingAmount)
            } else if (task.patentTitle) {
                renderSection('PATENT DETAILS')
                renderField('Patent Title', task.patentTitle)
                renderField('App Number', task.applicationNumber)
                renderField('Date', task.filingDate)
            }
            
            doc.save(`JJCET_Report_${task._id}.pdf`)
            toast.success('Report downloaded!')
        } catch (error) {
            console.error(error)
            toast.error('Failed to generate PDF')
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
                <div className="flex flex-wrap items-center gap-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">From Date</label>
                        <DatePicker
                            selected={fromDate}
                            onChange={setFromDate}
                            selectsStart
                            startDate={fromDate}
                            endDate={toDate}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
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
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholderText="To"
                            dateFormat="dd/MM/yyyy"
                        />
                    </div>
                    <div className="flex items-end pb-1">
                        <button
                            onClick={() => { setFromDate(null); setToDate(null) }}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Clear
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
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => {
                                                        const taskDate = new Date(task.date).toISOString().split('T')[0];
                                                        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/pdf?from=${taskDate}&to=${taskDate}&token=${localStorage.getItem('dawnow_token')}`, '_blank');
                                                    }}
                                                    className="p-2 text-primary-green hover:bg-primary-green/10 rounded-lg transition-colors"
                                                    title="Download Full Daily Report"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                                {task.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleEdit(task)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Entry"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
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
