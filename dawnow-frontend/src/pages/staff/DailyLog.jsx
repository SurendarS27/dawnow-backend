
import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, BookOpen, Send, TrendingUp, Smile, Calendar as CalendarIcon, Info } from 'lucide-react';
import Badge from '../../components/ui/Badge';

const DailyLog = () => {
    const [todayLog, setTodayLog] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState(0);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        workDone: '',
        hoursSpent: 8,
        category: 'Reading/Research',
        projectName: '',
        progressPercent: 50,
        tomorrowPlan: '',
        mood: 'Normal',
        isLeaveDay: false
    });

    const categories = [
        "Writing Paper", "Lab Work", "Reading/Research",
        "Meeting", "Grant Work", "Review", "Teaching",
        "Administrative", "Other"
    ];

    const moods = [
        { name: 'Productive', icon: '🚀' },
        { name: 'Normal', icon: '🙂' },
        { name: 'Slow', icon: '🐌' },
        { name: 'Stuck', icon: '🆘' }
    ];

    useEffect(() => {
        const fetchTodayData = async () => {
            try {
                const [logRes, streakRes] = await Promise.all([
                    API.get('/dailylog/today'),
                    API.get('/dailylog/streak')
                ]);

                if (logRes.data) {
                    setTodayLog(logRes.data);
                    setFormData({
                        ...logRes.data,
                        date: new Date(logRes.data.date).toISOString().split('T')[0]
                    });
                }
                setStreak(streakRes.data.streak);
                fetchLogs();
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTodayData();
    }, []);

    const fetchLogs = async () => {
        try {
            const params = {};
            if (fromDate) params.from = fromDate;
            if (toDate) params.to = toDate;
            const res = await API.get('/dailylog', { params });
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const groupLogsByDate = (logs) => {
        const groups = {};
        logs.forEach(log => {
            const date = new Date(log.date).toDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(log);
        });
        return groups;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/dailylog', formData);
            setTodayLog(res.data);
            toast.success(todayLog ? 'Log updated!' : 'Log submitted!');

            // Re-fetch streak and logs
            const [streakRes] = await Promise.all([
                API.get('/dailylog/streak'),
                fetchLogs()
            ]);
            setStreak(streakRes.data.streak);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit log');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Daily R&D Log</h1>
                    <p className="text-slate-500">Track your research activity for today: {new Date().toDateString()}</p>
                </div>
                <div className="text-center bg-primary-green/10 px-4 py-2 rounded-lg border border-primary-green/20">
                    <span className="text-2xl font-bold text-primary-green">{streak}</span>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Days Streak</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-primary-green px-6 py-3">
                    <h2 className="text-white font-semibold flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Today's Work Submission
                    </h2>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center space-x-2 bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-800 text-sm">
                        <Info className="w-4 h-4 flex-shrink-0" />
                        <p>Consistency is key to research. Aim to log your progress daily!</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">What did I work on?*</label>
                            <textarea
                                value={formData.workDone}
                                onChange={(e) => setFormData({ ...formData, workDone: e.target.value })}
                                required
                                rows={4}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green outline-none transition-all"
                                placeholder="Describe your activities/research for today..."
                            ></textarea>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Tomorrow's Plan</label>
                                <textarea
                                    value={formData.tomorrowPlan}
                                    onChange={(e) => setFormData({ ...formData, tomorrowPlan: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green outline-none transition-all"
                                    placeholder="What are the next steps?"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green outline-none"
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Hours Spent</label>
                            <input
                                type="number"
                                min="0" max="24"
                                value={formData.hoursSpent}
                                onChange={(e) => setFormData({ ...formData, hoursSpent: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green outline-none"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name</label>
                            <input
                                type="text"
                                value={formData.projectName}
                                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green outline-none"
                                placeholder="e.g. IoT-based Energy Meter Study"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Progress on current task: <span className="text-primary-green text-lg">{formData.progressPercent}%</span>
                            </label>
                            {/* Visual progress bar */}
                            <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden border border-slate-200">
                                <div
                                    className="h-full rounded-full transition-all duration-500 ease-out"
                                    style={{
                                        width: `${formData.progressPercent}%`,
                                        background: formData.progressPercent <= 25
                                            ? 'linear-gradient(90deg, #ef4444, #f97316)'
                                            : formData.progressPercent <= 50
                                                ? 'linear-gradient(90deg, #f97316, #eab308)'
                                                : formData.progressPercent <= 75
                                                    ? 'linear-gradient(90deg, #eab308, #22c55e)'
                                                    : 'linear-gradient(90deg, #22c55e, #16a34a)'
                                    }}
                                />
                            </div>
                            {/* Clickable preset percentage buttons */}
                            <div className="grid grid-cols-6 gap-2">
                                {[0, 10, 25, 50, 75, 100].map(val => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, progressPercent: val })}
                                        className={`py-2 rounded-lg border text-sm font-bold transition-all duration-200 ${formData.progressPercent === val
                                                ? 'bg-primary-green text-white border-primary-green shadow-md scale-105'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-primary-green hover:text-primary-green hover:bg-primary-green/5'
                                            }`}
                                    >
                                        {val}%
                                    </button>
                                ))}
                            </div>
                            {/* Fine-tune slider */}
                            <input
                                type="range"
                                min="0" max="100"
                                value={formData.progressPercent}
                                onChange={(e) => setFormData({ ...formData, progressPercent: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-green mt-3"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                                <span>Not Started</span>
                                <span>In Progress</span>
                                <span>Completed</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">How was today?</label>
                            <div className="flex space-x-4">
                                {moods.map(m => (
                                    <button
                                        key={m.name}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, mood: m.name })}
                                        className={`flex-1 py-1 rounded-lg border flex flex-col items-center transition-all ${formData.mood === m.name
                                            ? 'bg-primary-green/10 border-primary-green text-primary-green ring-2 ring-primary-green/10'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <span className="text-xl">{m.icon}</span>
                                        <span className="text-[10px] uppercase font-bold mt-1 tracking-tighter">{m.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center cursor-pointer select-none">
                            <input
                                type="checkbox"
                                id="leave"
                                checked={formData.isLeaveDay}
                                onChange={(e) => setFormData({ ...formData, isLeaveDay: e.target.checked })}
                                className="mr-2"
                            />
                            <label htmlFor="leave" className="text-sm font-medium text-slate-600">Mark as Leave Day</label>
                        </div>

                        <button
                            type="submit"
                            className="bg-primary-green hover:bg-primary-green-dark text-white font-bold py-2.5 px-8 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {todayLog ? 'Update Log' : 'Submit Today\'s Log'}
                        </button>
                    </div>
                </div>
            </form>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="font-bold text-slate-800 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-primary-green" />
                        Log History
                    </h2>
                    <div className="flex items-center space-x-2">
                        <input 
                            type="date" 
                            className="text-xs border rounded p-1" 
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                        <span className="text-xs text-slate-400">to</span>
                        <input 
                            type="date" 
                            className="text-xs border rounded p-1" 
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                        <button 
                            onClick={fetchLogs}
                            className="text-xs bg-slate-100 px-2 py-1 rounded font-bold text-slate-600 hover:bg-slate-200"
                        >
                            Filter
                        </button>
                    </div>
                </div>
                
                <div className="divide-y divide-slate-100">
                    {logs.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">No logs found for this period.</div>
                    ) : (
                        Object.entries(groupLogsByDate(logs)).map(([date, dateLogs]) => (
                            <div key={date} className="p-6">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                                    <div className="h-px bg-slate-100 flex-grow mr-4"></div>
                                    {date}
                                    <div className="h-px bg-slate-100 flex-grow ml-4"></div>
                                </h3>
                                <div className="space-y-4">
                                    {dateLogs.map((log, i) => (
                                        <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center space-x-3">
                                                    <Badge variant="outline">{log.category}</Badge>
                                                    <span className="text-xs font-bold text-slate-500 flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" /> {log.hoursSpent} hrs
                                                    </span>
                                                    {log.isLeaveDay && <Badge variant="rejected">Leave</Badge>}
                                                </div>
                                                <span className="text-xl">{moods.find(m => m.name === log.mood)?.icon}</span>
                                            </div>
                                            <p className="text-slate-700 text-sm font-medium leading-relaxed">{log.workDone}</p>
                                            {log.tomorrowPlan && (
                                                <div className="mt-3 pt-3 border-t border-slate-200/50">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Tomorrow's Plan</p>
                                                    <p className="text-slate-500 text-xs italic">{log.tomorrowPlan}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-primary-green" />
                    Month Activity View
                </h3>
                <div className="grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
                            {day}
                        </div>
                    ))}
                    {(() => {
                        const now = new Date();
                        const year = now.getFullYear();
                        const month = now.getMonth();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const firstDayOfWeek = new Date(year, month, 1).getDay();
                        const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => (
                            <div key={`blank-${i}`} className="aspect-square" />
                        ));
                        const days = Array.from({ length: daysInMonth }, (_, i) => {
                            const dayNum = i + 1;
                            const isToday = dayNum === now.getDate();
                            const hasLog = logs.some(l => new Date(l.date).getDate() === dayNum && new Date(l.date).getMonth() === month);
                            return (
                                <div
                                    key={dayNum}
                                    className={`aspect-square rounded border flex items-center justify-center text-xs font-bold transition-all ${
                                        isToday
                                            ? 'bg-primary-green text-white border-primary-green ring-2 ring-primary-green/30'
                                            : hasLog 
                                                ? 'bg-primary-green/20 text-primary-green border-primary-green/20'
                                                : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-primary-green/10 hover:border-primary-green/30'
                                    }`}
                                >
                                    {dayNum}
                                </div>
                            );
                        });
                        return [...blanks, ...days];
                    })()}
                </div>
            </div>
        </div>
    );
};

export default DailyLog;
