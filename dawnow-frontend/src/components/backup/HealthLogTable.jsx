import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';

const HealthLogTable = () => {
    const fetchHealth = async () => {
        const { data } = await axios.get('/api/backup/health', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return data;
    };

    const { data: logs, isLoading } = useQuery({
        queryKey: ['healthLogs'],
        queryFn: fetchHealth,
        refetchInterval: 60000 // Poll every 60s
    });

    if (isLoading) {
        return (
            <div className="p-10 text-center text-slate-400 font-bold italic animate-pulse">
                Loading health logs...
            </div>
        );
    }

    const healthLogs = logs || [];

    return (
        <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {healthLogs.length === 0 && (
                <div className="px-5 py-10 text-center text-slate-400 italic text-sm">
                    No health checks recorded yet.
                </div>
            )}
            {healthLogs.map((log, idx) => (
                <div key={idx} className="px-5 py-3 hover:bg-slate-50/50 transition-all">
                    <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                            log.status === 'healthy'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : log.status === 'degraded'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                            {log.status === 'healthy' ? '✅' : log.status === 'degraded' ? '⚠️' : '❌'} {log.status || 'unknown'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                            {log.checkedAt ? format(new Date(log.checkedAt), 'dd MMM HH:mm:ss') : '—'}
                        </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium flex gap-3">
                        <span>Main: {log.mainDbConnected ? '🟢' : '🔴'}</span>
                        <span>Backup: {log.backupDbConnected ? '🟢' : '🔴'}</span>
                        {log.responseTimeMs != null && (
                            <span className="text-slate-400">{log.responseTimeMs}ms</span>
                        )}
                    </div>
                    {log.error && (
                        <p className="text-[10px] text-rose-500 mt-1 font-mono truncate" title={log.error}>
                            {log.error}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default HealthLogTable;
