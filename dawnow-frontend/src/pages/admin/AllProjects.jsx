import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import ProjectTable from '../../components/projects/ProjectTable';
import StatusBadge from '../../components/projects/StatusBadge';
import { FolderOpen, Plus, X, Calendar, User, Building2, DollarSign, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';

const AllProjects = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        status: 'All',
        department: 'All',
        agency: '',
        startDate: '',
        endDate: '',
    });

    const [viewProject, setViewProject] = useState(null);
    const [deleteProject, setDeleteProject] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.status !== 'All') params.status = filters.status;
            if (filters.department !== 'All') params.department = filters.department;
            if (filters.agency) params.agency = filters.agency;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const res = await API.get('/projects', { params });
            setProjects(res.data.projects || []);
        } catch (err) {
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const timer = setTimeout(fetchProjects, 300);
        return () => clearTimeout(timer);
    }, [fetchProjects]);

    const handleEdit = (project) => {
        navigate(`/admin/submit-project?edit=${project._id}`);
    };

    const handleDelete = (project) => {
        setDeleteProject(project);
    };

    const confirmDelete = async () => {
        if (!deleteProject) return;
        setDeleting(true);
        try {
            await API.delete(`/projects/${deleteProject._id}`);
            toast.success('Project deleted successfully');
            setDeleteProject(null);
            fetchProjects();
        } catch (err) {
            toast.error('Failed to delete project');
        } finally {
            setDeleting(false);
        }
    };

    const handleView = (project) => {
        setViewProject(project);
    };

    const formatCurrency = (amount) => `₹ ${(amount || 0).toLocaleString('en-IN')}`;
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FolderOpen size={24} className="text-primary-green" />
                        All College Projects
                    </h1>
                    <p className="text-gray-500 text-sm">View, filter, and manage all submitted college projects</p>
                </div>
                <button
                    onClick={() => navigate('/admin/submit-project')}
                    className="flex items-center gap-2 bg-primary-green text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-green-dark shadow-sm transition-all text-sm"
                >
                    <Plus size={18} />
                    New Project
                </button>
            </div>

            {/* Project Table */}
            <ProjectTable
                projects={projects}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                filters={filters}
                onFilterChange={setFilters}
            />

            {/* View Project Modal */}
            {viewProject && (
                <Modal isOpen={true} onClose={() => setViewProject(null)} title="Project Details" size="xl">
                    <div className="space-y-6">
                        {/* Title & Status */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{viewProject.projectTitle}</h2>
                                <p className="text-sm text-gray-500 mt-1">{viewProject.institution}</p>
                            </div>
                            <StatusBadge status={viewProject.status} />
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <User size={14} className="text-gray-400" />
                                <span className="text-gray-500">PI:</span>
                                <span className="font-medium text-gray-800">{viewProject.principalInvestigator}</span>
                            </div>
                            {viewProject.coInvestigator && (
                                <div className="flex items-center gap-2 text-sm">
                                    <User size={14} className="text-gray-400" />
                                    <span className="text-gray-500">Co-PI:</span>
                                    <span className="font-medium text-gray-800">{viewProject.coInvestigator}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                                <Building2 size={14} className="text-gray-400" />
                                <span className="text-gray-500">Department:</span>
                                <span className="font-medium text-gray-800">{viewProject.department}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar size={14} className="text-gray-400" />
                                <span className="text-gray-500">Duration:</span>
                                <span className="font-medium text-gray-800">
                                    {formatDate(viewProject.startDate)} - {formatDate(viewProject.endDate)}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{viewProject.description}</p>
                        </div>

                        {/* Funding */}
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <DollarSign size={14} className="text-primary-green" />
                                Funding Details
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Agency</p>
                                    <p className="font-semibold text-gray-800">{viewProject.fundingAgency}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Scheme</p>
                                    <p className="font-semibold text-gray-800">{viewProject.fundingScheme}</p>
                                </div>
                                {viewProject.grantReferenceNumber && (
                                    <div>
                                        <p className="text-gray-500">Grant Ref #</p>
                                        <p className="font-semibold text-gray-800">{viewProject.grantReferenceNumber}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-gray-500">Sanctioned</p>
                                    <p className="font-semibold text-green-600">{formatCurrency(viewProject.amountSanctioned)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Received</p>
                                    <p className="font-semibold text-blue-600">{formatCurrency(viewProject.amountReceived)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Pending</p>
                                    <p className="font-semibold text-amber-600">{formatCurrency(viewProject.amountPending)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Info */}
                        {viewProject.statusRemarks && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-1">Status Remarks</h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{viewProject.statusRemarks}</p>
                            </div>
                        )}

                        {/* Documents */}
                        {(viewProject.documents?.projectReport || viewProject.documents?.sanctionLetter || viewProject.documents?.completionCertificate) && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FileText size={14} className="text-gray-400" />
                                    Documents
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {viewProject.documents?.projectReport && (
                                        <a
                                            href={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/${viewProject.documents.projectReport}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg"
                                        >
                                            Project Report
                                        </a>
                                    )}
                                    {viewProject.documents?.sanctionLetter && (
                                        <a
                                            href={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/${viewProject.documents.sanctionLetter}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg"
                                        >
                                            Sanction Letter
                                        </a>
                                    )}
                                    {viewProject.documents?.completionCertificate && (
                                        <a
                                            href={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/${viewProject.documents.completionCertificate}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg"
                                        >
                                            Completion Certificate
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {deleteProject && (
                <Modal isOpen={true} onClose={() => setDeleteProject(null)} title="Confirm Delete" size="sm">
                    <p className="text-gray-600 text-sm mb-4">
                        Are you sure you want to delete <strong>{deleteProject.projectTitle}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setDeleteProject(null)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AllProjects;
