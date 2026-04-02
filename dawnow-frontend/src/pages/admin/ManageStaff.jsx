import { useState, useEffect } from 'react'
import API from '../../api/axios'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

const ManageStaff = () => {
    const [staff, setStaff] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editingStaff, setEditingStaff] = useState(null)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        staffId: '',
        department: '',
        designation: 'Assistant Professor',
        email: '',
        phone: '',
        username: '',
        password: '',
        qualification: '',
        experience: '',
        joinDate: ''
    })

    const departments = ['CSE', 'EEE', 'ECE', 'MECH', 'CIVIL', 'IT', 'MCA']
    const designations = ['Dean', 'Director', 'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Research Scholar']

    useEffect(() => {
        fetchStaff()
    }, [search])

    const fetchStaff = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.append('search', search)

            const response = await API.get(`/admin/staff?${params}`)
            setStaff(response.data || [])
        } catch (error) {
            console.error('Error fetching staff:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (staffMember = null) => {
        if (staffMember) {
            setEditingStaff(staffMember)
            setFormData({
                name: staffMember.name || '',
                staffId: staffMember.staffId || '',
                department: staffMember.department || '',
                designation: staffMember.designation || 'Assistant Professor',
                email: staffMember.email || '',
                phone: staffMember.phone || '',
                username: staffMember.username || '',
                password: '',
                qualification: staffMember.qualification || '',
                experience: staffMember.experience || '',
                joinDate: staffMember.joinDate ? new Date(staffMember.joinDate).toISOString().split('T')[0] : ''
            })
        } else {
            setEditingStaff(null)
            setFormData({
                name: '',
                staffId: '',
                department: '',
                designation: 'Assistant Professor',
                email: '',
                phone: '',
                username: '',
                password: '',
                qualification: '',
                experience: '',
                joinDate: ''
            })
        }
        setModalOpen(true)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            if (editingStaff) {
                await API.put(`/admin/staff/${editingStaff._id}`, formData)
                toast.success('Staff updated successfully')
            } else {
                await API.post('/admin/staff', formData)
                toast.success('Staff created successfully')
            }
            setModalOpen(false)
            fetchStaff()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save staff')
        } finally {
            setSaving(false)
        }
    }

    const handleToggle = async (id) => {
        try {
            const response = await API.patch(`/admin/staff/${id}/toggle`)
            toast.success(response.data.message)
            fetchStaff()
        } catch (error) {
            toast.error('Failed to toggle status')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this staff member?')) return

        try {
            await API.delete(`/admin/staff/${id}`)
            toast.success('Staff deleted successfully')
            fetchStaff()
        } catch (error) {
            toast.error('Failed to delete staff')
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search staff..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-700"
                    >
                        <Plus size={18} />
                        Add Staff
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dept</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : staff.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No staff found</td>
                                </tr>
                            ) : (
                                staff.map((member, index) => (
                                    <tr key={member._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{member.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{member.department}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{member.designation}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{member.username}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={member.isActive ? 'success' : 'danger'}>
                                                {member.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(member)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(member._id)}
                                                    className={`p-1 rounded ${member.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                                                    title={member.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {member.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(member._id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
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

            {/* Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingStaff ? 'Edit Staff' : 'Add New Staff'}
                size="lg"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID *</label>
                            <input
                                type="text"
                                value={formData.staffId}
                                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                required
                                disabled={!!editingStaff}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                required
                            >
                                <option value="">Select</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                            <select
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                {designations.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                required
                                disabled={!!editingStaff}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password {editingStaff ? '(leave blank to keep)' : '*'}
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                required={!editingStaff}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                            <input
                                type="text"
                                value={formData.qualification}
                                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                            <input
                                type="text"
                                value={formData.experience}
                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 border rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-primary-green text-white rounded-lg disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default ManageStaff
