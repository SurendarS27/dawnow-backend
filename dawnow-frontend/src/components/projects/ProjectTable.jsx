import React, { useState } from 'react';
import { Eye, Edit2, Trash2, Search, Filter, X } from 'lucide-react';
import StatusBadge from './StatusBadge';

const DEPARTMENTS = ['All', 'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'MCA', 'Other'];
const STATUSES = ['All', 'Prepared', 'Submitted', 'Revision', 'Accepted', 'Published'];

const ProjectTable = ({ projects, loading, onEdit, onDelete, onView, filters, onFilterChange }) => {
    const [showFilters, setShowFilters] = useState(false);

    const formatCurrency = (amount) => {
        return `₹ ${(amount || 0).toLocaleString('en-IN')}`;
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Filter Bar */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title or PI name..."
                            value={filters.search}
                            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-green focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    >
                        {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
                    </select>

                    {/* Department Filter */}
                    <select
                        value={filters.department}
                        onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    >
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
                    </select>

                    {/* Toggle Advanced Filters */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition-all ${showFilters ? 'border-primary-green text-primary-green bg-green-50' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Filter size={14} />
                        More
                    </button>

                    {/* Clear Filters */}
                    {(filters.search || filters.status !== 'All' || filters.department !== 'All' || filters.agency || filters.startDate || filters.endDate) && (
                        <button
                            onClick={() => onFilterChange({ search: '', status: 'All', department: 'All', agency: '', startDate: '', endDate: '' })}
                            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <X size={14} />
                            Clear
                        </button>
                    )}
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3">
                        <div className="min-w-[160px]">
                            <label className="text-xs text-gray-500 mb-1 block">Agency</label>
                            <input
                                type="text"
                                placeholder="Filter by agency..."
                                value={filters.agency}
                                onChange={(e) => onFilterChange({ ...filters, agency: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-green focus:border-transparent"
                            />
                        </div>
                        <div className="min-w-[140px]">
                            <label className="text-xs text-gray-500 mb-1 block">From Date</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-green focus:border-transparent"
                            />
                        </div>
                        <div className="min-w-[140px]">
                            <label className="text-xs text-gray-500 mb-1 block">To Date</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-green focus:border-transparent"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                            <th className="px-4 py-3 border-b">#</th>
                            <th className="px-4 py-3 border-b">Project Title</th>
                            <th className="px-4 py-3 border-b">PI Name</th>
                            <th className="px-4 py-3 border-b">Department</th>
                            <th className="px-4 py-3 border-b">Agency</th>
                            <th className="px-4 py-3 border-b">Amount (&#8377;)</th>
                            <th className="px-4 py-3 border-b">Status</th>
                            <th className="px-4 py-3 border-b">Date</th>
                            <th className="px-4 py-3 border-b text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-green mb-3"></div>
                                        <p className="text-gray-500 text-sm">Loading projects...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : projects.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="px-4 py-12 text-center text-gray-400">
                                    No projects found. Try adjusting your filters or create a new project.
                                </td>
                            </tr>
                        ) : (
                            projects.map((project, index) => (
                                <tr key={project._id} className="group hover:bg-gray-50/80 transition-all border-b last:border-0">
                                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-gray-800 text-sm max-w-[200px] truncate" title={project.projectTitle}>
                                            {project.projectTitle}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{project.principalInvestigator}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{project.department}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[120px] truncate" title={project.fundingAgency}>
                                        {project.fundingAgency}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                                        {formatCurrency(project.amountSanctioned)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={project.status} />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(project.createdAt)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => onView(project)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => onEdit(project)}
                                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(project)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
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
    );
};

export default ProjectTable;
