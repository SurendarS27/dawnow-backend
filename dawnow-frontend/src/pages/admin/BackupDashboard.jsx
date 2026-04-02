import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import BackupStatusCard from '../../components/backup/BackupStatusCard';
import SyncVerifyTable from '../../components/backup/SyncVerifyTable';
import BackupHistoryTable from '../../components/backup/BackupHistoryTable';
import ManualBackupButton from '../../components/backup/ManualBackupButton';
import RestorePanel from '../../components/backup/RestorePanel';
import HealthLogTable from '../../components/backup/HealthLogTable';

const BackupDashboard = () => {
    // API context: All backup routes go through /api/backup/*
    const fetchStatus = async () => {
        const { data } = await axios.get('/api/backup/status', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return data;
    };

    const { data: status, isLoading, refetch } = useQuery({
        queryKey: ['backupStatus'],
        queryFn: fetchStatus,
        refetchInterval: 30000 // Poll every 30s
    });

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">System Backup & Disaster Recovery</h1>
                    <p className="text-slate-500 mt-2 font-medium">🛡️ Production-grade real-time security management for CFRD DAW NOW</p>
                </div>
                <div className="flex gap-3">
                     <button 
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-all font-semibold flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh Data
                    </button>
                    <ManualBackupButton onTriggered={() => {
                        toast.success('Backup sequence initiated in background!');
                        setTimeout(refetch, 2000);
                    }} />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Status & Sync */}
                <div className="lg:col-span-8 space-y-8 text-slate-700">
                    <BackupStatusCard status={status} loading={isLoading} />
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Sync Verification
                            </h2>
                        </div>
                        <SyncVerifyTable />
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Backup History
                            </h2>
                        </div>
                        <BackupHistoryTable />
                    </div>
                </div>

                {/* Right Column: Health & Restore */}
                <div className="lg:col-span-4 space-y-8">
                    <RestorePanel />
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                System Health Logs
                            </h2>
                        </div>
                        <HealthLogTable />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupDashboard;
