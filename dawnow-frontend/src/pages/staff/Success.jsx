import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ArrowLeft, Plus, FileText, Award, BookOpen, Lightbulb, Users } from 'lucide-react'

const Success = () => {
    const navigate = useNavigate()
    const [submissionData, setSubmissionData] = useState(null)
    const [showContent, setShowContent] = useState(false)

    useEffect(() => {
        // Get submission data from sessionStorage
        const savedData = sessionStorage.getItem('lastSubmission')
        if (savedData) {
            setSubmissionData(JSON.parse(savedData))
        }

        // Clear session storage after reading
        sessionStorage.removeItem('lastSubmission')

        // Trigger animation
        setTimeout(() => setShowContent(true), 300)
    }, [])

    if (!showContent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-green/5 to-green-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-green"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-green/5 to-green-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                {/* Success Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center transform transition-all duration-500 hover:scale-105">
                    {/* Animated Checkmark */}
                    <div className="relative mx-auto w-24 h-24 mb-6">
                        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
                        <div className="relative w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                            <CheckCircle2 size={48} className="text-white animate-bounce" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-heading font-bold text-gray-800 mb-2">
                        Submission Successful!
                    </h1>
                    <p className="text-gray-500 mb-8">
                        Your research workload has been recorded successfully.
                    </p>

                    {/* Summary Card */}
                    {submissionData && (
                        <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
                            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <FileText size={18} />
                                Submission Summary
                            </h3>
                            <div className="space-y-3">
                                {submissionData.paperTitle && (
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <FileText size={18} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Paper</p>
                                            <p className="text-sm font-medium text-gray-800 truncate">{submissionData.paperTitle}</p>
                                        </div>
                                    </div>
                                )}
                                {submissionData.projectName && (
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Award size={18} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Project</p>
                                            <p className="text-sm font-medium text-gray-800 truncate">{submissionData.projectName}</p>
                                        </div>
                                    </div>
                                )}
                                {submissionData.patentTitle && (
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                            <Lightbulb size={18} className="text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Patent</p>
                                            <p className="text-sm font-medium text-gray-800 truncate">{submissionData.patentTitle}</p>
                                        </div>
                                    </div>
                                )}
                                {submissionData.bookTitle && (
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <BookOpen size={18} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Book</p>
                                            <p className="text-sm font-medium text-gray-800 truncate">{submissionData.bookTitle}</p>
                                        </div>
                                    </div>
                                )}
                                {submissionData.activityTitle && (
                                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                            <Users size={18} className="text-pink-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Activity</p>
                                            <p className="text-sm font-medium text-gray-800 truncate">{submissionData.activityTitle}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                    Date: {new Date(submissionData.date).toLocaleDateString()} | Year: {submissionData.academicYear}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/staff/dashboard')}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-green text-white rounded-xl hover:bg-green-700 transition-colors font-medium shadow-lg shadow-green-500/30"
                        >
                            <ArrowLeft size={20} />
                            Back to Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/staff/task-entry')}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                        >
                            <Plus size={20} />
                            Submit Another
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-400 text-sm mt-6">
                    Powered by <span className="text-primary-green font-semibold">NexoraCrew</span>
                </p>
            </div>
        </div>
    )
}

export default Success
