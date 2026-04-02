import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    Activity, Book, Award, Users, FileText,
    ArrowUpRight, Download, Calendar, Filter
} from 'lucide-react';
import Badge from '../../components/ui/Badge';

const Analytics = () => {
    const [overview, setOverview] = useState({
        sciPapersAccepted: 0,
        sciPapersPublished: 0,
        scopusPapersAccepted: 0,
        scopusPapersPublished: 0,
        patentPublished: 0,
        patentGrant: 0,
        conferencePapersAccepted: 0,
        conferencePapersPublished: 0,
        bookChaptersAccepted: 0,
        bookChaptersPublished: 0,
        fundingApplied: 0,
        fundingReceived: 0,
        totalPapers: 0,
        totalSCI: 0,
        totalPatents: 0,
        totalFunded: 0
    });
    const [periodData, setPeriodData] = useState({
        papers: 0,
        patents: 0,
        funded: 0,
        activities: 0
    });
    const [deptData, setDeptData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [topPerformers, setTopPerformers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('overview'); // 'overview', 'weekly', 'monthly'

    const COLORS = ['#16a34a', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6'];

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const [ovRes, deptRes, trRes, topRes, periodRes] = await Promise.all([
                    API.get('/analytics/overview'),
                    API.get('/analytics/by-department'),
                    API.get('/analytics/monthly-trend'),
                    API.get('/analytics/top-performers'),
                    period === 'overview' ? Promise.resolve({ data: null }) : API.get(`/analytics/${period}`)
                ]);
                
                setOverview(ovRes.data || {
                    sciPapersAccepted: 0,
                    sciPapersPublished: 0,
                    scopusPapersAccepted: 0,
                    scopusPapersPublished: 0,
                    patentPublished: 0,
                    patentGrant: 0,
                    conferencePapersAccepted: 0,
                    conferencePapersPublished: 0,
                    bookChaptersAccepted: 0,
                    bookChaptersPublished: 0,
                    fundingApplied: 0,
                    fundingReceived: 0,
                    totalPapers: 0,
                    totalSCI: 0,
                    totalPatents: 0,
                    totalFunded: 0
                });

                if (period !== 'overview' && periodRes.data) {
                    setPeriodData(periodRes.data);
                }

                setDeptData(deptRes.data || []);
                setTrendData(trRes.data || []);
                setTopPerformers(topRes.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [period]);

    const getDisplayStats = () => {
        if (period === 'overview') {
            return [
                { label: 'Total Papers', value: overview?.totalPapers || 0, icon: Book, color: 'emerald', trend: '+12%' },
                { label: 'SCI Publications', value: overview?.totalSCI || 0, icon: FileText, color: 'blue', trend: '+5%' },
                { label: 'Patents Filed', value: overview?.totalPatents || 0, icon: Award, color: 'amber', trend: '+2' },
                { label: 'Grants Received', value: overview?.totalFunded || 0, icon: Activity, color: 'purple', trend: 'New!' }
            ];
        } else {
            return [
                { label: `${period === 'weekly' ? 'Weekly' : 'Monthly'} Papers`, value: periodData.papers || 0, icon: Book, color: 'emerald', trend: 'Selected' },
                { label: `${period === 'weekly' ? 'Weekly' : 'Monthly'} Patents`, value: periodData.patents || 0, icon: Award, color: 'amber', trend: 'Selected' },
                { label: `${period === 'weekly' ? 'Weekly' : 'Monthly'} Projects`, value: periodData.funded || 0, icon: Activity, color: 'purple', trend: 'Selected' },
                { label: `${period === 'weekly' ? 'Weekly' : 'Monthly'} Activities`, value: periodData.activities || 0, icon: FileText, color: 'blue', trend: 'Selected' }
            ];
        }
    };

    const stats = getDisplayStats();

    const handleExportPDF = () => {
        const token = localStorage.getItem('dawnow_token');
        if (!token) {
            toast?.error?.('Session expired. Please login again.') || alert('Session expired. Please login again.');
            return;
        }
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reports/analytics-pdf?token=${token}`;
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">CFRD Analytics Portal</h1>
                    <p className="text-slate-500 text-sm">Real-time research performance monitoring.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setPeriod('overview')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${period === 'overview' ? 'bg-white text-primary-green shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setPeriod('weekly')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${period === 'weekly' ? 'bg-white text-primary-green shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setPeriod('monthly')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${period === 'monthly' ? 'bg-white text-primary-green shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Monthly
                        </button>
                    </div>
                    <button 
                        onClick={handleExportPDF}
                        className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-100 transition-all text-sm"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {period === 'overview' ? (
                <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl border border-slate-800 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-green/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <h2 className="text-xl font-bold mb-8 flex items-center border-b border-slate-800 pb-4">
                        <Activity className="w-5 h-5 mr-2 text-primary-green" />
                        Research Output Overview
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-y-10 gap-x-8 relative z-10">
                        {/* Row 1 */}
                        <div className="space-y-2">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">sci papers</p>
                            <p className="text-slate-500 text-[10px] uppercase">accepted / published</p>
                            <div className="flex items-baseline space-x-1">
                                <span className="text-3xl font-black text-white">{overview.sciPapersAccepted}</span>
                                <span className="text-slate-600 text-xl">/</span>
                                <span className="text-3xl font-black text-primary-green">{overview.sciPapersPublished}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Scopus paper</p>
                            <p className="text-slate-500 text-[10px] uppercase">accepted / published</p>
                            <div className="flex items-baseline space-x-1">
                                <span className="text-3xl font-black text-white">{overview.scopusPapersAccepted}</span>
                                <span className="text-slate-600 text-xl">/</span>
                                <span className="text-3xl font-black text-primary-green">{overview.scopusPapersPublished}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">patent published</p>
                            <div className="pt-4 flex items-center border-t border-slate-800">
                                <span className="text-3xl font-black text-white">{overview.patentPublished}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">patent grant</p>
                            <div className="pt-4 flex items-center border-t border-slate-800">
                                <span className="text-3xl font-black text-white">{overview.patentGrant}</span>
                            </div>
                        </div>

                        {/* Divider Line for Desktop */}
                        <div className="hidden md:block col-span-4 h-px bg-primary-green/30 my-2"></div>

                        {/* Row 2 */}
                        <div className="space-y-2">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">conference paper</p>
                            <p className="text-slate-500 text-[10px] uppercase">accepted / published</p>
                            <div className="flex items-baseline space-x-1">
                                <span className="text-3xl font-black text-white">{overview.conferencePapersAccepted}</span>
                                <span className="text-slate-600 text-xl">/</span>
                                <span className="text-3xl font-black text-primary-green">{overview.conferencePapersPublished}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">book/book chapter</p>
                            <div className="pt-4">
                                <div className="flex items-baseline space-x-1">
                                    <span className="text-3xl font-black text-white">{overview.bookChaptersAccepted}</span>
                                    <span className="text-slate-600 text-xl">/</span>
                                    <span className="text-3xl font-black text-primary-green">{overview.bookChaptersPublished}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">funding Applied</p>
                            <div className="pt-4 flex items-center border-t border-slate-800">
                                <span className="text-3xl font-black text-white">{overview.fundingApplied}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Funding received</p>
                            <div className="pt-4 flex items-center border-t border-slate-800">
                                <span className="text-3xl font-black text-white">{overview.fundingReceived || 'nil'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-${stat.color}-200 transition-all cursor-pointer`}>
                            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${stat.color}-500/5 rounded-full group-hover:bg-${stat.color}-500/10 transition-all`}></div>
                            <div className="flex justify-between items-start">
                                <stat.icon className={`w-10 h-10 text-${stat.color}-600 bg-${stat.color}-50 p-2 rounded-lg transition-transform group-hover:scale-110`} />
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center">
                                    <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />
                                    {stat.trend}
                                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                                <p className="text-slate-500 font-medium text-sm">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-slate-800 flex items-center">
                            <Activity className="w-4 h-4 mr-2 text-primary-green" />
                            Research Output Trend
                        </h2>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">12-Month Performance</span>
                    </div>
                    <ResponsiveContainer width="100%" height="90%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                cursor={{ stroke: '#16a34a', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-slate-800 flex items-center">
                            <Users className="w-4 h-4 mr-2 text-brand-blue" />
                            Departmental Contributions
                        </h2>
                        <Badge label="Active Departments" color="blue" />
                    </div>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={deptData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis type="category" dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend iconType="circle" />
                            <Bar dataKey="papers" fill="#16a34a" radius={[0, 4, 4, 0]} name="Papers" />
                            <Bar dataKey="patents" fill="#2563eb" radius={[0, 4, 4, 0]} name="Patents" />
                            <Bar dataKey="funded" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Funded" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-slate-800 flex items-center">
                        <Award className="w-4 h-4 mr-2 text-amber-500" />
                        Current Top Performers
                    </h2>
                    <span className="text-xs text-slate-400">Scores based on approved research activities</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                                <th className="px-4 py-3 border-b">Rank</th>
                                <th className="px-4 py-3 border-b">Member Name</th>
                                <th className="px-4 py-3 border-b">Department</th>
                                <th className="px-4 py-3 border-b">Research Score</th>
                                <th className="px-4 py-3 border-b text-right">Badges</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topPerformers.map((staff, i) => (
                                <tr key={staff._id} className="group hover:bg-slate-50/80 transition-all border-b last:border-0">
                                    <td className="px-4 py-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-amber-100 text-amber-700' :
                                            i === 1 ? 'bg-slate-200 text-slate-700' :
                                                i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {i + 1}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 font-bold text-slate-700">{staff.name}</td>
                                    <td className="px-4 py-4 text-slate-500 text-sm">{staff.department}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary-green rounded-full" style={{ width: `${Math.min(100, staff.totalScore / 10)}%` }}></div>
                                            </div>
                                            <span className="text-sm font-bold text-primary-green">{staff.totalScore} pts</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex justify-end -space-x-1">
                                            {(staff.badges || []).slice(0, 3).map((b, bi) => (
                                                <div key={bi} className="bg-white border w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm z-10">{b}</div>
                                            )) || '⭐'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {topPerformers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400">No performance data yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
