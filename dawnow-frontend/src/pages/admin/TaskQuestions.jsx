import { useState, useEffect } from 'react'
import { questionAPI, dailyLogAPI } from '../../api'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, GripVertical, Save, Clock, Settings, Search, Calendar } from 'lucide-react'

const TaskQuestions = () => {
    const [questions, setQuestions] = useState([])
    const [groupedQuestions, setGroupedQuestions] = useState({})
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState(null)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('builder') // 'builder' or 'logs'
    const [dailyLogs, setDailyLogs] = useState([])
    const [logsLoading, setLogsLoading] = useState(false)
    const [logSearch, setLogSearch] = useState('')

    const [formData, setFormData] = useState({
        questionText: '',
        type: 'text',
        section: 'general',
        label: '',
        placeholder: '',
        required: false,
        order: 0,
        options: []
    })

    const [newOption, setNewOption] = useState('')

    // Section definitions with display names
    const sections = [
        { value: 'paper', label: 'Paper Workload' },
        { value: 'project', label: 'Funded Project' },
        { value: 'patent', label: 'Patent' },
        { value: 'book', label: 'Book Writing' },
        { value: 'activity', label: 'Activities' },
        { value: 'additional', label: 'Additional Details' },
        { value: 'general', label: 'General' }
    ]

    // Question types
    const questionTypes = [
        { value: 'text', label: 'Text Input' },
        { value: 'textarea', label: 'Text Area' },
        { value: 'number', label: 'Number' },
        { value: 'date', label: 'Date Picker' },
        { value: 'yesno', label: 'Yes/No' },
        { value: 'mcq', label: 'Multiple Choice (Single)' },
        { value: 'checkbox', label: 'Checkbox (Multiple)' }
    ]

    useEffect(() => {
        if (activeTab === 'builder') {
            fetchQuestions()
        } else {
            fetchDailyLogs()
        }
    }, [activeTab])

    const fetchQuestions = async () => {
        setLoading(true)
        try {
            const response = await questionAPI.getAll()
            const data = response.data
            setQuestions(data.questions || data || [])
            setGroupedQuestions(data.grouped || {})
        } catch (error) {
            console.error('Error fetching questions:', error)
            toast.error('Failed to load questions')
        } finally {
            setLoading(false)
        }
    }

    const fetchDailyLogs = async () => {
        setLogsLoading(true)
        try {
            const response = await dailyLogAPI.getAllAdmin()
            setDailyLogs(response.data || [])
        } catch (error) {
            console.error('Error fetching logs:', error)
            toast.error('Failed to load daily logs')
        } finally {
            setLogsLoading(false)
        }
    }

    const handleOpenModal = (question = null) => {
        if (question) {
            setEditingQuestion(question)
            setFormData({
                questionText: question.questionText || question.text || '',
                type: question.type || 'text',
                section: question.section || 'general',
                label: question.label || '',
                placeholder: question.placeholder || '',
                required: question.required || false,
                order: question.order || 0,
                options: question.options || []
            })
        } else {
            setEditingQuestion(null)
            setFormData({
                questionText: '',
                type: 'text',
                section: 'general',
                label: '',
                placeholder: '',
                required: false,
                order: questions.length,
                options: []
            })
        }
        setNewOption('')
        setModalOpen(true)
    }

    const handleAddOption = () => {
        if (newOption.trim()) {
            setFormData(prev => ({
                ...prev,
                options: [...prev.options, newOption.trim()]
            }))
            setNewOption('')
        }
    }

    const handleRemoveOption = (index) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }))
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            // Prepare payload
            const payload = {
                questionText: formData.questionText,
                type: formData.type,
                section: formData.section,
                label: formData.label || formData.questionText,
                placeholder: formData.placeholder,
                required: formData.required,
                order: formData.order,
                options: ['mcq', 'checkbox'].includes(formData.type) ? formData.options : []
            }

            if (editingQuestion) {
                await questionAPI.update(editingQuestion._id, payload)
                toast.success('Question updated successfully')
            } else {
                await questionAPI.create(payload)
                toast.success('Question created successfully')
            }
            setModalOpen(false)
            fetchQuestions()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save question')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this question?')) return

        try {
            await questionAPI.delete(id)
            toast.success('Question deleted successfully')
            fetchQuestions()
        } catch (error) {
            toast.error('Failed to delete question')
        }
    }

    const handleToggle = async (question) => {
        try {
            await questionAPI.toggle(question._id)
            toast.success(`Question ${question.isActive ? 'deactivated' : 'activated'}`)
            fetchQuestions()
        } catch (error) {
            toast.error('Failed to toggle question status')
        }
    }

    const getSectionBadge = (section) => {
        const colors = {
            paper: 'info',
            project: 'success',
            patent: 'warning',
            book: 'default',
            activity: 'info',
            additional: 'success',
            general: 'default'
        }
        return <Badge variant={colors[section] || 'default'}>{section}</Badge>
    }

    const getTypeBadge = (type) => {
        const typeLabel = questionTypes.find(t => t.value === type)?.label || type
        return <Badge variant="default">{typeLabel}</Badge>
    }

    const showOptions = ['mcq', 'checkbox'].includes(formData.type)

    return (
        <div className="space-y-6">
            {/* Tab Switching */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('builder')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'builder'
                            ? 'border-primary-green text-primary-green'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Settings size={18} />
                    Question Builder
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'logs'
                            ? 'border-primary-green text-primary-green'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Clock size={18} />
                    Log History (Staff Daily Activities)
                </button>
            </div>

            {activeTab === 'builder' ? (
                <>
                    {/* Built-in Sections Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-heading font-semibold text-gray-800 mb-4">Built-in Sections</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {['Paper Workload', 'Funded Project', 'Patent', 'Book Writing', 'Other Activities'].map((section, idx) => (
                        <div key={section} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="font-medium text-gray-700">{section}</p>
                            <p className="text-xs text-gray-500 mt-1">Built-in field</p>
                        </div>
                    ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                    These are built-in sections and cannot be deleted. They appear automatically on the staff task entry form.
                </p>
            </div>

            {/* Dynamic Questions by Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-heading font-semibold text-gray-800">Dynamic Questions</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Create custom questions that appear on the staff task entry form
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus size={18} />
                        Add Question
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-green mx-auto"></div>
                        <p className="mt-2">Loading questions...</p>
                    </div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-lg mb-2">No questions yet</p>
                        <p className="text-sm">Click "Add Question" to create your first dynamic question</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedQuestions).map(([section, sectionQuestions]) => (
                            <div key={section} className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                    <h3 className="font-medium text-gray-700 capitalize">
                                        {sections.find(s => s.value === section)?.label || section} ({sectionQuestions.length})
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {sectionQuestions.map((question, index) => (
                                        <div key={question._id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0 mt-1 text-gray-400 cursor-move">
                                                    <GripVertical size={18} />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-grow">
                                                            <p className="font-medium text-gray-800">
                                                                {question.label || question.questionText}
                                                            </p>
                                                            {question.label && question.questionText && (
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    {question.questionText}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-2">
                                                                {getTypeBadge(question.type)}
                                                                {getSectionBadge(question.section)}
                                                                {question.required && (
                                                                    <Badge variant="danger">Required</Badge>
                                                                )}
                                                            </div>
                                                            {question.options && question.options.length > 0 && (
                                                                <p className="text-xs text-gray-500 mt-2">
                                                                    Options: {question.options.join(', ')}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleToggle(question)}
                                                                className={`p-2 rounded-lg transition-colors ${question.isActive
                                                                        ? 'text-green-600 hover:bg-green-50'
                                                                        : 'text-gray-400 hover:bg-gray-100'
                                                                    }`}
                                                                title={question.isActive ? 'Deactivate' : 'Activate'}
                                                            >
                                                                {question.isActive ? (
                                                                    <ToggleRight size={22} />
                                                                ) : (
                                                                    <ToggleLeft size={22} />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenModal(question)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(question._id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </>
            ) : (
                <LogHistoryView 
                    logs={dailyLogs} 
                    loading={logsLoading} 
                    logSearch={logSearch}
                    setLogSearch={setLogSearch}
                />
            )}
            {/* Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingQuestion ? 'Edit Question' : 'Add New Question'}
                size="lg"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    {/* Question Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Text *
                        </label>
                        <textarea
                            value={formData.questionText}
                            onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                            rows={2}
                            required
                            placeholder="Enter the question text that will be displayed to staff"
                        />
                    </div>

                    {/* Short Label */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Short Label
                        </label>
                        <input
                            type="text"
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                            placeholder="Short label for tables/lists (optional)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            If empty, the question text will be used as the label
                        </p>
                    </div>

                    {/* Type and Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Question Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                            >
                                {questionTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Section *
                            </label>
                            <select
                                value={formData.section}
                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                            >
                                {sections.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Placeholder */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Placeholder Text
                        </label>
                        <input
                            type="text"
                            value={formData.placeholder}
                            onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                            placeholder="Placeholder text for the input field"
                        />
                    </div>

                    {/* Options for MCQ/Checkbox */}
                    {showOptions && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Options *
                            </label>
                            <div className="space-y-2">
                                {(formData.options || []).map((option, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="flex-grow px-3 py-2 bg-gray-50 rounded-lg text-sm">
                                            {option}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveOption(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="text"
                                    value={newOption}
                                    onChange={(e) => setNewOption(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                                    placeholder="Enter option text"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddOption}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Required Toggle */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, required: !formData.required })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.required ? 'bg-primary-green' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.required ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <span className="text-sm font-medium text-gray-700">
                            Required field
                        </span>
                    </div>

                    {/* Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Display Order
                        </label>
                        <input
                            type="number"
                            value={formData.order}
                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                            min={0}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Questions will be displayed in ascending order within each section
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || (showOptions && formData.options.length === 0)}
                            className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save size={16} />
                            {saving ? 'Saving...' : 'Save Question'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

const LogHistoryView = ({ logs, loading, logSearch, setLogSearch }) => {
    const filteredLogs = logs.filter(log =>
        log.staff?.name?.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.workDone?.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.staff?.department?.toLowerCase().includes(logSearch.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-heading font-semibold text-gray-800">Staff Daily Log History</h2>
                        <p className="text-sm text-gray-500 mt-1">View history of daily activities submitted by staff</p>
                    </div>
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={logSearch}
                            onChange={(e) => setLogSearch(e.target.value)}
                            placeholder="Search by staff, work, or dept..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent min-w-[280px]"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-green mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading daily logs...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                        <Calendar size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-lg mb-2">No activity logs found</p>
                        <p className="text-sm">Daily logs submitted by staff will appear here</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table className="w-full">
                            <thead className="bg-gray-50 border-y border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Staff Member</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Work Done</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hours</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                                            {new Date(log.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-primary-green/10 flex items-center justify-center text-primary-green font-bold text-xs mr-3">
                                                    {log.staff?.name?.charAt(0) || 'S'}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-800">{log.staff?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <Badge variant="info">{log.staff?.department || 'N/A'}</Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="max-w-xs overflow-hidden text-ellipsis text-sm text-gray-700">
                                                {log.isLeaveDay ? (
                                                    <span className="text-orange-600 font-bold italic">LEAVE DAY</span>
                                                ) : (
                                                    log.workDone || <span className="text-gray-400 italic">No description</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {log.hoursSpent ? `${log.hoursSpent} hrs` : '-'}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-primary-green h-full rounded-full"
                                                        style={{ width: `${log.progressPercent || 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-500">{log.progressPercent || 0}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    )
}

const Table = ({ children, className }) => <table className={className}>{children}</table>

export default TaskQuestions
