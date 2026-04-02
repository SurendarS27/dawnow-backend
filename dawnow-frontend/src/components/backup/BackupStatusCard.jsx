import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';

const BackupStatusCard = ({ status, loading }) => {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-32 mb-4"></div>
                <div className="flex gap-4">
                    <div className="h-10 bg-slate-100 rounded flex-1"></div>
                    <div className="h-10 bg-slate-100 rounded flex-1"></div>
                </div>
            </div>
        );
    }

    const { lastSnapshot, lastHealth, dbConnected, backupDbConnected } = status || {};

    const lastBackupTime = lastSnapshot ? 
        formatDistanceToNow(new Date(lastSnapshot.createdAt)) : 'Never';
    
    const sysHealthy = dbConnected && backupDbConnected;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between">
                    {/* Status Overview */}
                    <div className="flex-1">
                        <h3 className="text-slate-500 font-bold uppercase text-xs tracking-wider mb-2">System Status</h3>
                        <div className="flex items-center gap-3">
                            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase flex items-center gap-2 ${sysHealthy ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                <span className={`w-2 h-2 rounded-full ${sysHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`}></span>
                                {sysHealthy ? 'Healthy' : (dbConnected ? 'Degraded' : 'Crashed')}
                            </div>
                            <span className="text-slate-400 font-light translate-y-px">|</span>
                            <div className="text-sm font-semibold text-slate-600">
                                Main Atlas: {dbConnected ? '✅' : '❌'} | Backup Atlas: {backupDbConnected ? '✅' : '❌'}
                            </div>
                        </div>
                    </div>

                    {/* Last Backup Summary */}
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <h3 className="text-slate-400 font-bold uppercase text-xs tracking-wider mb-1">Last Backup</h3>
                        <div className="text-lg font-black text-slate-700">{lastBackupTime} ago</div>
                        <div className="text-xs text-slate-500 mt-1 flex gap-2 font-medium">
                            <span>📦 {lastSnapshot?.totalDocuments?.toLocaleString() || 0} docs</span>
                            <span className="text-slate-300">•</span>
                            <span>📄 {lastSnapshot?.collections?.pdfs?.count || 0} PDFs</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Quick Stats Bar */}
            <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-3 flex gap-4 text-xs font-bold text-slate-400">
                <div className="flex items-center gap-1.5 uppercase tracking-tighter">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Auto-refreshes in 30s
                </div>
                <div className="flex items-center gap-1.5 uppercase tracking-tighter">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    Real-time triggers enabled
                </div>
            </div>
        </div>
    );
};

export default BackupStatusCard;
