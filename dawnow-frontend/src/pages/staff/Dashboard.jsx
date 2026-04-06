import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import {
    Trophy, TrendingUp, Calendar, Bell,
    FileText, CheckCircle, Clock, AlertCircle,
    ArrowRight, Star, Target, Zap, Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BannerBox from '../../components/ui/BannerBox';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        score: 0,
        rank: '#12',
        streak: 5,
        nextGoal: { title: 'SCI Paper', progress: 65 },
        recentLogs: [],
        notices: []
    });

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [userRes, streakRes, noticeRes, taskRes] = await Promise.all([
                    API.get('/score/my'),
                    API.get('/dailylog/streak'),
                    API.get('/notices'),
                    API.get('/staff/tasks?limit=5')
                ]);

                setDashboardData({
                    score: userRes?.data?.totalScore || 0,
                    rank: '#15', // Placeholder for rank
                    streak: streakRes?.data?.streak || 0,
                    nextGoal: { title: 'Annual Research Target', progress: 45 },
                    notices: noticeRes?.data || [],
                    recentLogs: taskRes?.data?.tasks || []
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const handleDownloadPDF = (task) => {
        try {
            const doc = new jsPDF()
            const pageWidth = doc.internal.pageSize.getWidth()
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(14)
            doc.text('JJCET - CENTRE FOR RESEARCH & DEVELOPMENT', pageWidth/2, 15, {align: 'center'})
            doc.setFontSize(10)
            doc.text(`Staff: ${user?.name}`, 20, 30)
            doc.text(`Activity: ${task.paperTitle || task.projectName || task.patentTitle || 'Research Entry'}`, 20, 37)
            doc.text(`Date: ${new Date(task.date).toLocaleDateString()}`, 20, 44)
            doc.save(`Report_${task._id}.pdf`)
            toast.success('Report downloaded!')
        } catch (e) {
            toast.error('PDF generation failed')
        }
    }

    if (loading) return <div className="p-8 text-center animate-pulse">Loading Workspace...</div>;

    return (
        <div className="space-y-6 pb-12">
            <BannerBox />
            {/* Header / Welcome */}
            <div className="relative overflow-hidden bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-green/5 rounded-full -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                            Welcome back, <span className="text-primary-green">Dr. {user?.name.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium italic">"Research is creating new knowledge." — Neil Armstrong</p>
                        <div className="flex items-center mt-4 space-x-4">
                            <div className="flex items-center bg-amber-50 rounded-full px-3 py-1 border border-amber-100">
                                <Star className="w-3.5 h-3.5 text-amber-500 mr-1.5 fill-amber-500" />
                                <span className="text-xs font-bold text-amber-700 uppercase">{user?.designation}</span>
                            </div>
                            <div className="flex items-center bg-slate-100 rounded-full px-3 py-1 border border-slate-200">
                                <Zap className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                                <span className="text-xs font-bold text-slate-600 uppercase">{user?.department}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <div className="bg-white border-2 border-primary-green/20 p-4 rounded-2xl text-center shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Research Rank</p>
                            <span className="text-2xl font-black text-primary-green">#15</span>
                        </div>
                        <div className="bg-primary-green p-4 rounded-2xl text-center shadow-lg shadow-primary-green/20">
                            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Total Score</p>
                            <span className="text-2xl font-black text-white">{dashboardData.score}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-rose-50 rounded-xl">
                                    <Target className="w-6 h-6 text-rose-600" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Progress</span>
                            </div>
                            <h3 className="font-bold text-slate-800 mb-4">{dashboardData.nextGoal.title}</h3>
                            <ProgressBar value={dashboardData.nextGoal.progress} label="Yearly Goal Completion" color="bg-rose-500" />
                            <Link to="/staff/task-entry" className="mt-4 text-xs font-bold text-rose-600 flex items-center hover:underline uppercase tracking-wider">
                                Update Research Entry <ArrowRight className="w-3 h-3 ml-1" />
                            </Link>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-amber-50 rounded-xl">
                                    <Trophy className="w-6 h-6 text-amber-600" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Achievement Streak</span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 mb-1">{dashboardData.streak} Days</h3>
                            <p className="text-slate-500 text-sm">Consistent research activity detected.</p>
                            <div className="mt-4 flex -space-x-2">
                                {['🏆', '🔬', '⭐', '🔥'].map((emoji, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-sm shadow-sm">{emoji}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-primary-green" />
                                Recent Research Entries
                            </h2>
                            <Link to="/staff/view-report" className="text-xs font-bold text-primary-green uppercase tracking-wider hover:underline">View All</Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {dashboardData.recentLogs.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm italic">No research activities submitted yet.</div>
                            ) : (
                                dashboardData.recentLogs.map((task, i) => (
                                    <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-primary-green/10 p-2 rounded-lg">
                                                <FileText className="w-4 h-4 text-primary-green" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
                                                    {task.paperTitle || task.projectName || task.patentTitle || 'Research Entry'}
                                                </h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                    {new Date(task.date).toLocaleDateString()} • {task.status}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDownloadPDF(task)}
                                            className="p-2 text-slate-400 hover:text-primary-green hover:bg-primary-green/5 rounded-lg transition-all"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800 flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-primary-green" />
                                Activity Consistency
                            </h2>
                        </div>
                        <div className="p-6">
                            {/* Heatmap Placeholder */}
                            <div className="grid grid-cols-7 md:grid-cols-14 gap-2">
                                {Array.from({ length: 42 }, (_, i) => (
                                    <div
                                        key={i}
                                        className={`aspect-square rounded-md border ${Math.random() > 0.6 ? 'bg-primary-green/40 border-primary-green/20' :
                                            Math.random() > 0.8 ? 'bg-primary-green border-primary-green/30 shadow-sm' :
                                                'bg-slate-50 border-slate-100'
                                            }`}
                                        title={`Activity on day ${i}`}
                                    ></div>
                                ))}
                            </div>
                            <div className="flex justify-end items-center mt-4 space-x-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Less</span>
                                <div className="flex space-x-1">
                                    <div className="w-3 h-3 bg-slate-100 rounded-sm"></div>
                                    <div className="w-3 h-3 bg-primary-green/30 rounded-sm"></div>
                                    <div className="w-3 h-3 bg-primary-green/60 rounded-sm"></div>
                                    <div className="w-3 h-3 bg-primary-green rounded-sm"></div>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">More</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Informative */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mb-10 -mr-10 transition-transform group-hover:scale-110"></div>
                        <h2 className="font-bold mb-4 flex items-center">
                            <Bell className="w-4 h-4 mr-2 text-amber-400" />
                            CFRD Notice Board
                        </h2>
                        <div className="space-y-4 relative z-10">
                            {dashboardData.notices.length === 0 ? (
                                <p className="text-slate-400 text-sm">No new announcements today.</p>
                            ) : (
                                dashboardData.notices.slice(0, 3).map((notice, i) => (
                                    <div key={i} className="border-l-2 border-primary-green pl-4 py-1">
                                        <p className="text-xs font-black text-primary-green uppercase tracking-widest mb-1">{notice.category}</p>
                                        <h4 className="text-sm font-bold text-slate-100 truncate">{notice.title}</h4>
                                        <p className="text-[10px] text-slate-400 mt-1">{new Date(notice.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        <button className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/10">
                            View All Notices
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h2 className="font-bold text-slate-800 mb-4 flex items-center">
                            <Zap className="w-4 h-4 mr-2 text-primary-green" />
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/staff/daily-log" className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-primary-green/5 hover:border-primary-green/20 border border-transparent transition-all group">
                                <Clock className="w-5 h-5 text-slate-400 mb-2 group-hover:text-primary-green" />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Daily Log</span>
                            </Link>
                            <Link to="/staff/task-entry" className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-primary-green/5 hover:border-primary-green/20 border border-transparent transition-all group">
                                <FileText className="w-5 h-5 text-slate-400 mb-2 group-hover:text-primary-green" />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Research Entry</span>
                            </Link>
                            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl cursor-not-allowed opacity-60">
                                <Target className="w-5 h-5 text-slate-400 mb-2" />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">My Goals</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl cursor-not-allowed opacity-60">
                                <Trophy className="w-5 h-5 text-slate-400 mb-2" />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Awards</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary-green to-emerald-700 rounded-2xl p-6 shadow-lg text-white">
                        <TrendingUp className="w-10 h-10 mb-4 opacity-50" />
                        <h3 className="font-bold text-lg leading-tight mb-2">Grow your research profile today!</h3>
                        <p className="text-xs text-white/80 mb-6">Completing your daily log increases your activity score by +1 consistently.</p>
                        <button className="bg-white text-primary-green px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg">Learn More</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
