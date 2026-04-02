import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { questionAPI, answerAPI, taskAPI } from '../../api'
import toast from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { FileText, BookOpen, Award, Users, Plus, Eye, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const TaskEntry = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [questions, setQuestions] = useState([])
    const [groupedQuestions, setGroupedQuestions] = useState({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [date, setDate] = useState(new Date())
    const [academicYear, setAcademicYear] = useState('')
    const [showPreview, setShowPreview] = useState(false)

    // Dynamic answers state
    const [dynamicAnswers, setDynamicAnswers] = useState({})
    const [existingTaskId, setExistingTaskId] = useState(location.state?.editTaskId || null)

    // Static form data - Professional CFRD Format
    const initialFormData = {
        // Section 1: Paper Work Load Details
        paperTitle: '',
        paperStatus: '',
        journalType: '',
        journalName: '',
        impactFactor: '',

        // Section 2: Funded Project Work Load
        projectName: '',
        projectStatus: '',
        fundingTitle: '',
        fundingAgency: '',
        fundingAmount: '',

        // Section 3: Patent Work Load
        patentType: '',
        patentLevel: '',
        patentTitle: '',
        applicationNumber: '',
        filingDate: '',
        pageNumber: '',

        // Section 4: Book Writing Details
        authorName: '',
        bookStatus: '',
        bookTitle: '',
        publisherName: '',
        isbnNumber: '',
        publishedYear: '',

        // Section 5: Other Activities
        activityType: '',
        activityTitle: '',
        organizedBy: '',
        activityDate: '',

        // Section 6: Additional Workload
        additionalWorkload1: '',
        additionalWorkload2: '',
        additionalWorkload3: '',
        additionalWorkload4: '',
        additionalWorkload5: ''
    }

    const [formData, setFormData] = useState(initialFormData)

    // Load saved draft on mount
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await questionAPI.getActive()
                const data = response.data
                const questionsArray = data.questions || data || []
                const grouped = data.grouped || {}

                setQuestions(questionsArray)
                setGroupedQuestions(grouped)

                // Initialize dynamic answers state
                const initialAnswers = {}
                questionsArray.forEach(q => {
                    if (q.type === 'yesno') {
                        initialAnswers[q._id] = false
                    } else if (q.type === 'checkbox' || q.type === 'mcq') {
                        initialAnswers[q._id] = []
                    } else {
                        initialAnswers[q._id] = ''
                    }
                })
                setDynamicAnswers(initialAnswers)
            } catch (error) {
                console.error('Error fetching questions:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchQuestions()

        // Set current academic year
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth()
        if (month >= 6) {
            setAcademicYear(`${year}-${year + 1}`)
        } else {
            setAcademicYear(`${year - 1}-${year}`)
        }
    }, [])

    // Fetch initial task data if editing
    useEffect(() => {
        const fetchExistingTask = async () => {
            if (existingTaskId) {
                try {
                    const taskRes = await taskAPI.getById(existingTaskId)
                    const taskData = taskRes.data
                    
                    if (taskData) {
                        // Set the date
                        if (taskData.date) setDate(new Date(taskData.date))
                        
                        // Populate static form fields
                        const populatedForm = { ...initialFormData }
                        Object.keys(initialFormData).forEach(key => {
                            if (taskData[key]) {
                                // Format date for the datepicker if it's a date field
                                if ((key === 'filingDate' || key === 'activityDate') && taskData[key]) {
                                    populatedForm[key] = new Date(taskData[key]).toISOString().split('T')[0]
                                } else {
                                    populatedForm[key] = taskData[key]
                                }
                            }
                        })
                        setFormData(populatedForm)
                        
                        // Populate dynamic answers if any were saved with the task itself
                        if (taskData.dynamicAnswers && Object.keys(taskData.dynamicAnswers).length > 0) {
                            setDynamicAnswers(taskData.dynamicAnswers)
                        }
                    }
                } catch (error) {
                    console.error("Error fetching existing task", error)
                }
            } else {
                 // Try to load draft from localstorage ONLY if not editing
                 const savedDraft = localStorage.getItem('taskEntryDraft')
                 if (savedDraft) {
                     try {
                         const parsed = JSON.parse(savedDraft)
                         setFormData({ ...initialFormData, ...parsed })
                         toast.success('Draft restored from previous session', { duration: 2000 })
                     } catch (e) {
                         console.log('Could not restore draft')
                     }
                 }
            }
        }
        fetchExistingTask()
    }, [existingTaskId])

    // Handle normal dynamic answers fetch by date ONLY if not editing a specific task
    useEffect(() => {
        const fetchDynamicAnswers = async () => {
            if (!date || questions.length === 0 || existingTaskId) return

            try {
                const dateStr = date.toISOString().split('T')[0]
                const answerRes = await answerAPI.getByDate(dateStr)
                const existingAnswers = answerRes.data
                
                if (existingAnswers && Object.keys(existingAnswers).length > 0) {
                    setDynamicAnswers(prev => ({ ...prev, ...existingAnswers }))
                } else {
                    // Reset dynamic answers if none exist
                    const initialAnswers = {}
                    questions.forEach(q => {
                        if (q.type === 'yesno') initialAnswers[q._id] = false
                        else if (q.type === 'checkbox' || q.type === 'mcq') initialAnswers[q._id] = []
                        else initialAnswers[q._id] = ''
                    })
                    setDynamicAnswers(initialAnswers)
                }
            } catch (error) {
                // Ignore errors
            }
        }
        fetchDynamicAnswers()
    }, [date, questions, existingTaskId])

    // Handle static form field change
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // Handle dynamic answer change
    const handleDynamicAnswerChange = (questionId, value, type) => {
        setDynamicAnswers(prev => {
            if (type === 'checkbox' || type === 'mcq') {
                const current = prev[questionId] || []
                if (current.includes(value)) {
                    return { ...prev, [questionId]: current.filter(v => v !== value) }
                } else {
                    return { ...prev, [questionId]: [...current, value] }
                }
            }
            return { ...prev, [questionId]: value }
        })
    }

    // Render input field based on type
    const renderInput = (type, field, value, onChange, options = [], placeholder = '') => {
        switch (type) {
            case 'dropdown':
                return (
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent bg-white transition-all hover:border-primary-green"
                    >
                        <option value="">Select...</option>
                        {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                )
            case 'date':
                return (
                    <DatePicker
                        selected={value ? new Date(value) : null}
                        onChange={(d) => onChange(d ? d.toISOString().split('T')[0] : '')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                        dateFormat="dd/MM/yyyy"
                        placeholderText={placeholder || 'Select date'}
                    />
                )
            case 'textarea':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent resize-none transition-all"
                        rows={3}
                    />
                )
            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                        min={0}
                    />
                )
            default:
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all hover:border-primary-green"
                    />
                )
        }
    }

    // Form validation
    const validateForm = () => {
        if (!formData.paperTitle && !formData.projectName && !formData.patentTitle &&
            !formData.bookTitle && !formData.activityTitle &&
            !formData.additionalWorkload1 && !formData.additionalWorkload2) {
            toast.error('Please fill at least one field before submitting')
            return false
        }
        return true
    }

    // Clear all form data
    const handleClear = () => {
        setFormData(initialFormData)
        localStorage.removeItem('taskEntryDraft')

        // Clear dynamic answers
        const clearedAnswers = {}
        questions.forEach(q => {
            if (q.type === 'yesno') {
                clearedAnswers[q._id] = false
            } else if (q.type === 'checkbox' || q.type === 'mcq') {
                clearedAnswers[q._id] = []
            } else {
                clearedAnswers[q._id] = ''
            }
        })
        setDynamicAnswers(clearedAnswers)

        setDate(new Date())
        setExistingTaskId(null)
        navigate('/staff/task-entry', { replace: true, state: {} })
        toast.success('Form cleared')
    }

    // Generate PDF report
    const handleDownloadPDF = () => {
        const content = `
JJCET - Centre for Research & Development
Monthly Research Workload Report
=====================================

Staff Name: ${user?.name || 'N/A'}
Department: ${user?.department || 'N/A'}
Date: ${date.toLocaleDateString()}
Academic Year: ${academicYear}

SECTION 1: PAPER WORK LOAD
--------------------------
Paper Title: ${formData.paperTitle || 'N/A'}
Paper Status: ${formData.paperStatus || 'N/A'}
Journal Type: ${formData.journalType || 'N/A'}
Journal Name: ${formData.journalName || 'N/A'}
Impact Factor: ${formData.impactFactor || 'N/A'}

SECTION 2: FUNDED PROJECT
--------------------------
Project Name: ${formData.projectName || 'N/A'}
Project Status: ${formData.projectStatus || 'N/A'}
Funding Title: ${formData.fundingTitle || 'N/A'}
Funding Agency: ${formData.fundingAgency || 'N/A'}
Funding Amount: ${formData.fundingAmount ? `Rs. ${formData.fundingAmount}` : 'N/A'}

SECTION 3: PATENT
-----------------
Patent Type: ${formData.patentType || 'N/A'}
Patent Level: ${formData.patentLevel || 'N/A'}
Patent Title: ${formData.patentTitle || 'N/A'}
Application Number: ${formData.applicationNumber || 'N/A'}
Filing Date: ${formData.filingDate || 'N/A'}
Page Number: ${formData.pageNumber || 'N/A'}

SECTION 4: BOOK WRITING
------------------------
Author Name: ${formData.authorName || 'N/A'}
Book Status: ${formData.bookStatus || 'N/A'}
Book Title: ${formData.bookTitle || 'N/A'}
Publisher: ${formData.publisherName || 'N/A'}
ISBN: ${formData.isbnNumber || 'N/A'}
Year: ${formData.publishedYear || 'N/A'}

SECTION 5: OTHER ACTIVITIES
----------------------------
Activity Type: ${formData.activityType || 'N/A'}
Activity Title: ${formData.activityTitle || 'N/A'}
Organized By: ${formData.organizedBy || 'N/A'}
Date: ${formData.activityDate || 'N/A'}

SECTION 6: ADDITIONAL WORKLOAD
-------------------------------
${formData.additionalWorkload1 ? `1. ${formData.additionalWorkload1}` : ''}
${formData.additionalWorkload2 ? `2. ${formData.additionalWorkload2}` : ''}
${formData.additionalWorkload3 ? `3. ${formData.additionalWorkload3}` : ''}
${formData.additionalWorkload4 ? `4. ${formData.additionalWorkload4}` : ''}
${formData.additionalWorkload5 ? `5. ${formData.additionalWorkload5}` : ''}

=====================================
Generated on: ${new Date().toLocaleString()}
Powered by NexoraCrew
        `.trim()

        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `JJCET_Report_${date.toISOString().split('T')[0]}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Report downloaded!')
    }

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setSubmitting(true)

        try {
            // Combine static and dynamic data
            const payload = {
                date,
                academicYear,
                ...formData,
                dynamicAnswers
            }

            // Submit to staff tasks endpoint using axios taskAPI
            if (existingTaskId) {
                await taskAPI.update(existingTaskId, payload);
            } else {
                await taskAPI.create(payload);
            }

            // Submit dynamic answers
            if (Object.keys(dynamicAnswers).length > 0) {
                await answerAPI.submit({
                    answers: dynamicAnswers,
                    date: date.toISOString().split('T')[0],
                    academicYear
                })
            }

            toast.success('Report ' + (existingTaskId ? 'updated' : 'submitted') + ' successfully!')
            localStorage.removeItem('taskEntryDraft')
            
            // Immediately clear the form and reset completely
            setFormData(initialFormData)
            const clearedAnswers = {}
            questions.forEach(q => {
                if (q.type === 'yesno') clearedAnswers[q._id] = false
                else if (q.type === 'checkbox' || q.type === 'mcq') clearedAnswers[q._id] = []
                else clearedAnswers[q._id] = ''
            })
            setDynamicAnswers(clearedAnswers)
            setDate(new Date())
            setExistingTaskId(null)
            setShowPreview(false)
            navigate('/staff/task-entry', { replace: true, state: {} })
        } catch (error) {
            console.error('Error submitting task:', error)
            toast.error(error.response?.data?.message || 'Failed to submit report')
        } finally {
            setSubmitting(false)
        }
    }

    // Check if form has any data
    const hasData = Object.values(formData).some(v => v !== '')

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green mb-4"></div>
                <p className="text-gray-500">Loading form...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-gray-800">Research Workload Entry Form</h1>
                        <p className="text-sm text-gray-500 mt-1">JJCET - Centre for Research & Development</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">Academic Year: {academicYear}</p>
                        {hasData && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                                Draft saved
                            </p>
                        )}
                    </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Staff Name</label>
                        <input
                            type="text"
                            value={user?.name || ''}
                            readOnly
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <input
                            type="text"
                            value={user?.department || ''}
                            readOnly
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <DatePicker
                            selected={date}
                            onChange={(date) => setDate(date)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green"
                            dateFormat="dd/MM/yyyy"
                        />
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Paper Work Load Details */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                    <h2 className="text-lg font-heading font-semibold text-gray-800 mb-6 flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                            <FileText size={20} className="text-white" />
                        </div>
                        Paper Work Load Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Paper Title <span className="text-red-500">*</span>
                            </label>
                            {renderInput('text', 'paperTitle', formData.paperTitle, (v) => handleChange('paperTitle', v), [], 'Enter paper title')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Paper Status</label>
                            {renderInput('dropdown', 'paperStatus', formData.paperStatus, (v) => handleChange('paperStatus', v), ['Submitted', 'Revision', 'Accepted', 'Published', 'Prepared'])}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Journal Type</label>
                            {renderInput('dropdown', 'journalType', formData.journalType, (v) => handleChange('journalType', v), ['SCI', 'Scopus', 'Conference', 'UGC Care', 'Other'])}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Journal Name <span className="text-red-500">*</span>
                            </label>
                            {renderInput('text', 'journalName', formData.journalName, (v) => handleChange('journalName', v), [], 'Enter journal name')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Impact Factor</label>
                            {renderInput('number', 'impactFactor', formData.impactFactor, (v) => handleChange('impactFactor', v))}
                        </div>
                    </div>
                </div>

                {/* Section 2: Funded Project Work Load */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                    <h2 className="text-lg font-heading font-semibold text-gray-800 mb-6 flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                            <Award size={20} className="text-white" />
                        </div>
                        Funded Project Work Load
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project Name <span className="text-red-500">*</span>
                            </label>
                            {renderInput('text', 'projectName', formData.projectName, (v) => handleChange('projectName', v), [], 'Enter project name')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Project Status</label>
                            {renderInput('dropdown', 'projectStatus', formData.projectStatus, (v) => handleChange('projectStatus', v), ['Submitted', 'Approved', 'In Progress', 'Completed'])}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Funding Title</label>
                            {renderInput('text', 'fundingTitle', formData.fundingTitle, (v) => handleChange('fundingTitle', v), [], 'Enter funding title')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Funding Agency</label>
                            {renderInput('text', 'fundingAgency', formData.fundingAgency, (v) => handleChange('fundingAgency', v), [], 'Enter funding agency')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Funding Amount (Rs.)</label>
                            {renderInput('number', 'fundingAmount', formData.fundingAmount, (v) => handleChange('fundingAmount', v))}
                        </div>
                    </div>
                </div>

                {/* Section 3: Patent Work Load */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                    <h2 className="text-lg font-heading font-semibold text-gray-800 mb-6 flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                            <Award size={20} className="text-white" />
                        </div>
                        Patent Work Load
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Patent Type</label>
                            {renderInput('dropdown', 'patentType', formData.patentType, (v) => handleChange('patentType', v), ['Filed', 'Published', 'Granted'])}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Patent Level</label>
                            {renderInput('dropdown', 'patentLevel', formData.patentLevel, (v) => handleChange('patentLevel', v), ['First', 'Design', 'Utility'])}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Patent Title</label>
                            {renderInput('text', 'patentTitle', formData.patentTitle, (v) => handleChange('patentTitle', v), [], 'Enter patent title')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Application Number</label>
                            {renderInput('text', 'applicationNumber', formData.applicationNumber, (v) => handleChange('applicationNumber', v), [], 'Enter application number')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filing Date</label>
                            {renderInput('date', 'filingDate', formData.filingDate, (v) => handleChange('filingDate', v))}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Page Number</label>
                            {renderInput('text', 'pageNumber', formData.pageNumber, (v) => handleChange('pageNumber', v), [], 'Enter page number')}
                        </div>
                    </div>
                </div>

                {/* Section 4: Book Writing Details */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                    <h2 className="text-lg font-heading font-semibold text-gray-800 mb-6 flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                            <BookOpen size={20} className="text-white" />
                        </div>
                        Book Writing Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Author Name</label>
                            {renderInput('text', 'authorName', formData.authorName, (v) => handleChange('authorName', v), [], 'Enter author name')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Book Status</label>
                            {renderInput('dropdown', 'bookStatus', formData.bookStatus, (v) => handleChange('bookStatus', v), ['Published', 'In Progress', 'Completed'])}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Book Title</label>
                            {renderInput('text', 'bookTitle', formData.bookTitle, (v) => handleChange('bookTitle', v), [], 'Enter book title')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Publisher Name</label>
                            {renderInput('text', 'publisherName', formData.publisherName, (v) => handleChange('publisherName', v), [], 'Enter publisher name')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ISBN Number</label>
                            {renderInput('text', 'isbnNumber', formData.isbnNumber, (v) => handleChange('isbnNumber', v), [], 'Enter ISBN number')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Published Year</label>
                            {renderInput('number', 'publishedYear', formData.publishedYear, (v) => handleChange('publishedYear', v))}
                        </div>
                    </div>
                </div>

                {/* Section 5: Other Activities */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                    <h2 className="text-lg font-heading font-semibold text-gray-800 mb-6 flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                            <Users size={20} className="text-white" />
                        </div>
                        Other Activities
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                            {renderInput('dropdown', 'activityType', formData.activityType, (v) => handleChange('activityType', v), ['FDP', 'Workshop', 'Seminar', 'Conference', 'Guest Lecture', 'Webinar'])}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Activity Title</label>
                            {renderInput('text', 'activityTitle', formData.activityTitle, (v) => handleChange('activityTitle', v), [], 'Enter activity title')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Organized By</label>
                            {renderInput('text', 'organizedBy', formData.organizedBy, (v) => handleChange('organizedBy', v), [], 'Enter organizing body')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                            {renderInput('date', 'activityDate', formData.activityDate, (v) => handleChange('activityDate', v))}
                        </div>
                    </div>
                </div>

                {/* Section 6: Additional Workload */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                    <h2 className="text-lg font-heading font-semibold text-gray-800 mb-6 flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                            <Plus size={20} className="text-white" />
                        </div>
                        Additional Workload Details
                    </h2>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Workload 1</label>
                            {renderInput('textarea', 'additionalWorkload1', formData.additionalWorkload1, (v) => handleChange('additionalWorkload1', v), [], 'Describe additional workload or achievements...')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Workload 2</label>
                            {renderInput('textarea', 'additionalWorkload2', formData.additionalWorkload2, (v) => handleChange('additionalWorkload2', v), [], 'Describe additional workload or achievements...')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Workload 3</label>
                            {renderInput('textarea', 'additionalWorkload3', formData.additionalWorkload3, (v) => handleChange('additionalWorkload3', v), [], 'Describe additional workload or achievements...')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Workload 4</label>
                            {renderInput('textarea', 'additionalWorkload4', formData.additionalWorkload4, (v) => handleChange('additionalWorkload4', v), [], 'Describe additional workload or achievements...')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Workload 5</label>
                            {renderInput('textarea', 'additionalWorkload5', formData.additionalWorkload5, (v) => handleChange('additionalWorkload5', v), [], 'Describe additional workload or achievements...')}
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                {hasData && (
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className="w-full flex items-center justify-between text-lg font-heading font-semibold text-gray-800"
                        >
                            <span className="flex items-center">
                                <Eye size={20} className="mr-2" />
                                Review Your Submission
                            </span>
                            {showPreview ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {showPreview && (
                            <div className="mt-6 space-y-4 border-t pt-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-500">Paper:</span>
                                        <span className="ml-2 font-medium">{formData.paperTitle || 'N/A'}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-500">Journal:</span>
                                        <span className="ml-2 font-medium">{formData.journalName || 'N/A'}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-500">Project:</span>
                                        <span className="ml-2 font-medium">{formData.projectName || 'N/A'}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-500">Patent:</span>
                                        <span className="ml-2 font-medium">{formData.patentTitle || 'N/A'}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-500">Book:</span>
                                        <span className="ml-2 font-medium">{formData.bookTitle || 'N/A'}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-500">Activity:</span>
                                        <span className="ml-2 font-medium">{formData.activityTitle || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-end bg-white rounded-xl p-6 shadow-md">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
                    >
                        <Trash2 size={18} />
                        Clear All
                    </button>
                    <button
                        type="button"
                        onClick={handleDownloadPDF}
                        disabled={!hasData}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download size={18} />
                        Download Report
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || !hasData}
                        className="px-8 py-2.5 bg-primary-green text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-green-500/30"
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {existingTaskId ? 'Updating...' : 'Submitting...'}
                            </>
                        ) : (
                            <>
                                <FileText size={18} />
                                {existingTaskId ? 'Update Report' : 'Submit Report'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default TaskEntry
