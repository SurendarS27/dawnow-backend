import { useState, useEffect } from 'react'
import API from '../../api/axios'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import { Check, X } from 'lucide-react'

const PwdRequests = () => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('pending')
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [action, setAction] = useState('')
    const [adminNote, setAdminNote] = useState('')
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        fetchRequests()
    }, [statusFilter])

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (statusFilter) params.append('status', statusFilter)

            const response = await API.get(`/admin/pwd-requests?${params}`)
            setRequests(response.data || [])
        } catch (error) {
            console.error('Error fetching requests:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (request, actionType) => {
        setSelectedRequest(request)
        setAction(actionType)
        setAdminNote('')
        setModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setProcessing(true)

        try {
            await API.patch(`/admin/pwd-requests/${selectedRequest._id}`, {
                action,
                adminNote
            })
            toast.success(`Password request ${action}ed successfully`)
            setModalOpen(false)
            fetchRequests()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process request')
        } finally {
            setProcessing(false)
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

    const pendingRequests = requests.filter(r => r.status === 'pending')
    const processedRequests = requests.filter(r => r.status !== 'pending')

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-4">
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-4 py-2 rounded-lg ${statusFilter === 'pending' ? 'bg-primary-green text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        Pending ({pendingRequests.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-lg ${statusFilter === 'all' ? 'bg-primary-green text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        All History
                    </button>
                </div>
            </div>

            {/* Pending Requests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-heading font-semibold text-gray-800">Pending Requests</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested On</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : pendingRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No pending requests</td>
                                </tr>
                            ) : (
                                pendingRequests.map((request, index) => (
                                    <tr key={request._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{request.staff?.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{request.staff?.department}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(request.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(request, 'approve')}
                                                    className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                >
                                                    <Check size={16} />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(request, 'reject')}
                                                    className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                >
                                                    <X size={16} />
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Processed Requests History */}
            {statusFilter === 'all' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="font-heading font-semibold text-gray-800">History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested On</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed On</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {processedRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No history</td>
                                    </tr>
                                ) : (
                                    processedRequests.map((request, index) => (
                                        <tr key={request._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{request.staff?.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{request.staff?.department}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(request.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(request.updatedAt).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{request.adminNote || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={`${action === 'approve' ? 'Approve' : 'Reject'} Password Request`}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to {action} this password change request for{' '}
                        <strong>{selectedRequest?.staff?.name}</strong>?
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note (Optional)</label>
                        <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            rows={3}
                            placeholder="Add a note..."
                        />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${action === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                }`}
                        >
                            {processing ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default PwdRequests
