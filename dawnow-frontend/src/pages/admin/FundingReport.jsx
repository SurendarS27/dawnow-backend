import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import FundingCharts from '../../components/projects/FundingCharts';
import StatusBadge from '../../components/projects/StatusBadge';
import { BarChart3, FolderOpen, CheckCircle2, FileText, RefreshCw, DollarSign, Clock, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const FundingReport = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await API.get('/projects/report');
                setReportData(res.data);
            } catch (err) {
                toast.error('Failed to load funding report');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green mb-4"></div>
                    <p className="text-gray-500">Loading funding report...</p>
                </div>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-gray-500">No report data available</p>
            </div>
        );
    }

    const { totalProjects, byStatus, totalSanctioned, totalReceived, totalPending, topFunded, recentUpdates } = reportData;

    const statsCards = [
        { label: 'Total Projects', value: totalProjects, icon: FolderOpen, color: 'emerald' },
        { label: 'Total Accepted', value: byStatus?.accepted || 0, icon: CheckCircle2, color: 'green' },
        { label: 'Total Published', value: byStatus?.published || 0, icon: FileText, color: 'purple' },
        { label: 'In Revision', value: byStatus?.revision || 0, icon: RefreshCw, color: 'orange' },
        { label: 'Total Sanctioned', value: `₹ ${(totalSanctioned || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'green' },
        { label: 'Total Received', value: `₹ ${(totalReceived || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'blue' },
        { label: 'Total Pending', value: `₹ ${(totalPending || 0).toLocaleString('en-IN')}`, icon: Clock, color: 'amber' },
    ];

    const formatCurrency = (amount) => `₹ ${(amount || 0).toLocaleString('en-IN')}`;
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <BarChart3 size={24} className="text-primary-green" />
                    Funding Report
                </h1>
                <p className="text-gray-500 text-sm">Comprehensive overview of college project funding and status</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {statsCards.map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 transition-all">
                        <stat.icon size={18} className={`text-${stat.color}-600 mb-2`} />
                        <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <FundingCharts reportData={reportData} />

            {/* Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Table 1: Top Funded Projects */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <DollarSign size={18} className="text-primary-green" />
                        Top Funded Projects
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                                    <th className="px-3 py-2.5 border-b">Rank</th>
                                    <th className="px-3 py-2.5 border-b">Project Title</th>
                                    <th className="px-3 py-2.5 border-b">PI</th>
                                    <th className="px-3 py-2.5 border-b">Agency</th>
                                    <th className="px-3 py-2.5 border-b">Sanctioned</th>
                                    <th className="px-3 py-2.5 border-b">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(topFunded || []).length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-3 py-6 text-center text-gray-400 text-sm">
                                            No projects found
                                        </td>
                                    </tr>
                                ) : (
                                    topFunded.map((project, i) => (
                                        <tr key={project._id} className="border-b last:border-0 hover:bg-gray-50/50">
                                            <td className="px-3 py-2.5">
                                                <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {i + 1}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-sm font-medium text-gray-800 max-w-[150px] truncate" title={project.projectTitle}>
                                                {project.projectTitle}
                                            </td>
                                            <td className="px-3 py-2.5 text-sm text-gray-600">{project.principalInvestigator}</td>
                                            <td className="px-3 py-2.5 text-sm text-gray-600 max-w-[100px] truncate" title={project.fundingAgency}>
                                                {project.fundingAgency}
                                            </td>
                                            <td className="px-3 py-2.5 text-sm font-semibold text-green-600">
                                                {formatCurrency(project.amountSanctioned)}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <StatusBadge status={project.status} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Table 2: Recent Status Updates */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <RefreshCw size={18} className="text-blue-500" />
                        Recent Status Updates
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                                    <th className="px-3 py-2.5 border-b">Project Title</th>
                                    <th className="px-3 py-2.5 border-b">Status</th>
                                    <th className="px-3 py-2.5 border-b">Remarks</th>
                                    <th className="px-3 py-2.5 border-b">Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(recentUpdates || []).length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-3 py-6 text-center text-gray-400 text-sm">
                                            No recent updates
                                        </td>
                                    </tr>
                                ) : (
                                    recentUpdates.map((project) => (
                                        <tr key={project._id} className="border-b last:border-0 hover:bg-gray-50/50">
                                            <td className="px-3 py-2.5 text-sm font-medium text-gray-800 max-w-[150px] truncate" title={project.projectTitle}>
                                                {project.projectTitle}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <StatusBadge status={project.status} />
                                            </td>
                                            <td className="px-3 py-2.5 text-sm text-gray-600 max-w-[150px] truncate" title={project.statusRemarks}>
                                                {project.statusRemarks || '-'}
                                            </td>
                                            <td className="px-3 py-2.5 text-sm text-gray-500">
                                                {formatDate(project.updatedAt)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FundingReport;
