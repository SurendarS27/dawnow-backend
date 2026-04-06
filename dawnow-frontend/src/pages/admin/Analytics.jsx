import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    Activity, Users, FileText, Download, Calendar, Filter, 
    Briefcase, TrendingUp, FileSpreadsheet, Search, Award
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Analytics = () => {
    const [summary, setSummary] = useState({
        totalFaculty: 0,
        activeProjects: 0,
        reportsThisMonth: 0,
        logsThisWeek: 0
    });
    const [dailyLogs, setDailyLogs] = useState([]);
    const [activitiesByType, setActivitiesByType] = useState([]);
    const [projectStatus, setProjectStatus] = useState([]);
    const [monthlySummary, setMonthlySummary] = useState([]);
    const [facultyTable, setFacultyTable] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const COLORS = ['#16a34a', '#2563eb', '#f59e0b', '#8b5cf6', '#ef4444'];

    useEffect(() => {
        const fetchAllStats = async () => {
            setLoading(true);
            try {
                const [sumRes, logRes, typeRes, statusRes, monthRes, tableRes, reportRes] = await Promise.all([
                    API.get('/stats/summary'),
                    API.get('/stats/daily-logs'),
                    API.get('/stats/activities-by-type'),
                    API.get('/stats/project-status'),
                    API.get('/stats/monthly-summary'),
                    API.get('/stats/faculty-table'),
                    API.get('/stats/analytical-report')
                ]);

                setSummary(sumRes.data);
                setDailyLogs(logRes.data);
                setActivitiesByType(typeRes.data);
                setProjectStatus(statusRes.data);
                setMonthlySummary(monthRes.data);
                setFacultyTable(tableRes.data);
                setReportData(reportRes.data);
            } catch (err) {
                console.error('Stats fetch error:', err);
                toast.error('Failed to load real-time analytics');
            } finally {
                setLoading(false);
            }
        };

        fetchAllStats();
    }, []);

    const exportToCSV = () => {
        const worksheet = XLSX.utils.json_to_sheet(facultyTable);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Faculty Analytics");
        XLSX.writeFile(workbook, "CFRD_Faculty_Analytics.xlsx");
        toast.success('Excel report exported!');
    };

    const exportToPDF = async () => {
        if (!reportData) return;
        
        try {
            toast.loading('Generating Analytical Report...');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            
            // Header
            pdf.setFontSize(18);
            pdf.setTextColor(22, 163, 74); // primary-green
            pdf.text('JJCET - CFRD RESEARCH ANALYTICAL REPORT', pageWidth / 2, 20, { align: 'center' });
            
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, 28, { align: 'center' });
            
            pdf.setDrawColor(200, 200, 200);
            pdf.line(15, 35, pageWidth - 15, 35);

            pdf.setFontSize(11);
            pdf.setTextColor(0, 0, 0);
            
            const startY = 60;
            const colWidth = (pageWidth - 40) / 4;
            const rowHeight = 45;

            // Row 1
            // Col 1: sci papers
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('sci papers', 20, startY);
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(100, 100, 100);
            pdf.text('accepted / published', 20, startY + 6);
            pdf.setFontSize(14);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`${reportData.sci.accepted}  /  ${reportData.sci.published}`, 20, startY + 16);
            pdf.setDrawColor(22, 163, 74);
            pdf.line(20, startY + 18, 55, startY + 18);

            // Col 2: Scopus paper
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('Scopus paper', 20 + colWidth, startY);
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(100, 100, 100);
            pdf.text('accepted / published', 20 + colWidth, startY + 6);
            pdf.setFontSize(14);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`${reportData.scopus.accepted}  /  ${reportData.scopus.published}`, 20 + colWidth, startY + 16);
            pdf.line(20 + colWidth, startY + 18, 20 + colWidth + 35, startY + 18);

            // Col 3: patent published
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('patent published', 20 + colWidth * 2, startY);
            pdf.setFontSize(14);
            pdf.text(`${reportData.patent.published}`, 20 + colWidth * 2, startY + 16);
            pdf.line(20 + colWidth * 2, startY + 18, 20 + colWidth * 2 + 35, startY + 18);

            // Col 4: patent grant
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('patent grant', 20 + colWidth * 3, startY);
            pdf.setFontSize(14);
            pdf.text(`${reportData.patent.grant}`, 20 + colWidth * 3, startY + 16);
            pdf.line(20 + colWidth * 3, startY + 18, 20 + colWidth * 3 + 35, startY + 18);

            // Row 2
            const row2Y = startY + rowHeight;
            // Col 1: conference paper
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('conference paper', 20, row2Y);
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(100, 100, 100);
            pdf.text('accepted / published', 20, row2Y + 6);
            pdf.setFontSize(14);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`${reportData.conference.accepted}  /  ${reportData.conference.published}`, 20, row2Y + 16);
            pdf.line(20, row2Y + 18, 55, row2Y + 18);

            // Col 2: book/book chapter
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('book/book chapter', 20 + colWidth, row2Y);
            pdf.setFontSize(14);
            pdf.text(`${reportData.book} / ---`, 20 + colWidth, row2Y + 16);
            pdf.line(20 + colWidth, row2Y + 18, 20 + colWidth + 35, row2Y + 18);

            // Col 3: funding Applied
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('funding Applied', 20 + colWidth * 2, row2Y);
            pdf.setFontSize(14);
            pdf.text(`${reportData.funding.applied}`, 20 + colWidth * 2, row2Y + 16);
            pdf.line(20 + colWidth * 2, row2Y + 18, 20 + colWidth * 2 + 35, row2Y + 18);

            // Col 4: Funding received
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('Funding received', 20 + colWidth * 3, row2Y);
            pdf.setFontSize(14);
            pdf.text(`${reportData.funding.received > 0 ? reportData.funding.received : 'nil'}`, 20 + colWidth * 3, row2Y + 16);
            pdf.line(20 + colWidth * 3, row2Y + 18, 20 + colWidth * 3 + 35, row2Y + 18);

            // Summary Page 2
            pdf.addPage();
            pdf.setFontSize(16);
            pdf.setTextColor(22, 163, 74);
            pdf.text('Consolidated Dashboard Metrics', pageWidth / 2, 20, { align: 'center' });
            
            const element = document.getElementById('analytics-content');
            const canvas = await html2canvas(element, { scale: 1.5 });
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - 40;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 20, 30, imgWidth, imgHeight);

            pdf.save('CFRD_Analytical_Report.pdf');
            toast.dismiss();
            toast.success('Professional Report Downloaded!');
        } catch (err) {
            console.error(err);
            toast.dismiss();
            toast.error('Failed to generate PDF');
        }
    };

    const filteredFaculty = facultyTable.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.staffId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green mb-4"></div>
            <p className="text-gray-500 font-medium">Processing Analytical Data...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header - Matching Standard Style */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp size={24} className="text-primary-green" />
                        Executive Analytics
                    </h1>
                    <p className="text-gray-500 text-sm">Real-time performance metrics and research output tracking</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={exportToPDF} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-all border border-slate-200" title="Download PDF">
                        <Download size={20} />
                    </button>
                    <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white rounded-lg font-bold hover:bg-green-700 shadow-sm transition-all text-sm">
                        <FileSpreadsheet size={18} />
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Content for PDF capture */}
            <div id="analytics-content" className="space-y-6">
                {/* Stats Grid - Matching Funding Report */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Faculty', val: summary.totalFaculty, icon: Users, color: 'blue' },
                        { label: 'Active Projects', val: summary.activeProjects, icon: Briefcase, color: 'emerald' },
                        { label: 'Staff Reports (This Month)', val: summary.reportsThisMonth, icon: FileText, color: 'amber' },
                        { label: 'Daily Logs (This Week)', val: summary.logsThisWeek, icon: Activity, color: 'rose' }
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-gray-200 transition-all">
                            <s.icon className={`text-${s.color}-600 mb-2 w-5 h-5`} />
                            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{s.val}</h3>
                            <p className="text-xs font-medium text-gray-500">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Consolidated Research Metrics Grid - UI VERSION */}
                {reportData && (
                    <div className="bg-white p-8 rounded-2xl border border-primary-green/20 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <TrendingUp size={120} />
                        </div>
                        
                        <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                            <Award className="w-6 h-6 text-primary-green" />
                            Research Output Matrix
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-12 relative z-10">
                            {/* SCI Papers */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">sci papers</h3>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 font-bold">ACCEPTED / PUBLISHED</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-slate-800">{reportData.sci.accepted}</span>
                                        <span className="text-xl text-slate-300 font-light">/</span>
                                        <span className="text-3xl font-black text-primary-green">{reportData.sci.published}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-green" style={{ width: `${(reportData.sci.published / (reportData.sci.accepted + reportData.sci.published || 1)) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Scopus Papers */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scopus paper</h3>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 font-bold">ACCEPTED / PUBLISHED</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-slate-800">{reportData.scopus.accepted}</span>
                                        <span className="text-xl text-slate-300 font-light">/</span>
                                        <span className="text-3xl font-black text-blue-600">{reportData.scopus.published}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600" style={{ width: `${(reportData.scopus.published / (reportData.scopus.accepted + reportData.scopus.published || 1)) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Patent Published */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">patent published</h3>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 font-bold">TOTAL FILED</p>
                                    <div className="text-3xl font-black text-amber-500">{reportData.patent.published}</div>
                                    <div className="h-1 bg-amber-500/20 w-16"></div>
                                </div>
                            </div>

                            {/* Patent Grant */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">patent grant</h3>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 font-bold">OFFICIAL GRANTS</p>
                                    <div className="text-3xl font-black text-purple-600">{reportData.patent.grant}</div>
                                    <div className="h-1 bg-purple-600/20 w-16"></div>
                                </div>
                            </div>

                            {/* Row 2 */}
                            {/* Conference Paper */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">conference paper</h3>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 font-bold">ACCEPTED / PUBLISHED</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-slate-800">{reportData.conference.accepted}</span>
                                        <span className="text-xl text-slate-300 font-light">/</span>
                                        <span className="text-3xl font-black text-indigo-500">{reportData.conference.published}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${(reportData.conference.published / (reportData.conference.accepted + reportData.conference.published || 1)) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Book Chapter */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">book/book chapter</h3>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 font-bold">PUBLICATIONS</p>
                                    <div className="text-3xl font-black text-rose-500">{reportData.book}</div>
                                    <div className="h-1 bg-rose-500/20 w-16"></div>
                                </div>
                            </div>

                            {/* Funding Applied */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">funding Applied</h3>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 font-bold">SUBMITTED PROPOSALS</p>
                                    <div className="text-3xl font-black text-emerald-600">{reportData.funding.applied}</div>
                                    <div className="h-1 bg-emerald-600/20 w-16"></div>
                                </div>
                            </div>

                            {/* Funding Received */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funding received</h3>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 font-bold">SANCTIONED PROJECTS</p>
                                    <div className={`text-3xl font-black ${reportData.funding.received > 0 ? 'text-primary-green' : 'text-slate-300'}`}>
                                        {reportData.funding.received > 0 ? reportData.funding.received : 'NIL'}
                                    </div>
                                    <div className="h-1 bg-primary-green/20 w-16"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Primary Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-primary-green" />
                            Daily Submission Activity (Last 30 Days)
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyLogs}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" hide />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="count" stroke="#16a34a" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Briefcase size={18} className="text-blue-600" />
                            Research Output Distribution
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activitiesByType}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Tooltip />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {activitiesByType.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Calendar size={18} className="text-amber-500" />
                            Monthly Trend (Current Year)
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlySummary}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Search size={18} className="text-rose-500" />
                            Faculty Reporting Participation
                        </h3>
                        {/* Summary View Instead of Table */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm text-gray-600 font-medium">Active Reporters</span>
                                <span className="font-bold text-primary-green">{facultyTable.filter(f => f.reportsSubmitted > 0).length}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm text-gray-600 font-medium">Inactive in Last 30 Days</span>
                                <span className="font-bold text-rose-500">{facultyTable.filter(f => (!f.lastActive || new Date(f.lastActive) < new Date(Date.now() - 30*24*60*60*1000))).length}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm text-gray-600 font-medium">Avg reports per faculty</span>
                                <span className="font-bold text-blue-600">{(facultyTable.reduce((acc, f) => acc + f.reportsSubmitted, 0) / (facultyTable.length || 1)).toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List and Search - Dedicated Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <Users size={20} className="text-primary-green" />
                        Faculty Reporting Overview
                    </h2>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by name, ID, or dept..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                                <th className="px-6 py-4">Faculty</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4 text-center">Logs</th>
                                <th className="px-6 py-4 text-center">Reports</th>
                                <th className="px-6 py-4">Last Activity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFaculty.map((f, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-700 text-sm">{f.name}</span>
                                            <span className="text-[10px] text-gray-400 font-bold">{f.staffId}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{f.department}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-bold text-xs">{f.logsSubmitted}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md font-bold text-xs">{f.reportsSubmitted}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-gray-400">
                                        {f.lastActive ? new Date(f.lastActive).toLocaleDateString() : 'No Activity'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
