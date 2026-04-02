import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';

const BackupHistoryTable = () => {
    const fetchHistory = async () => {
        const { data } = await axios.get('/api/backup/history', {
            params: { limit: 20 },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return data;
    };

    const { data, isLoading } = useQuery({
        queryKey: ['backupHistory'],
        queryFn: fetchHistory,
        refetchInterval: 30000 // Poll history every 30s
    });

    if (isLoading) return <div className="p-10 text-center text-slate-400 font-bold italic animate-pulse">Scanning backup logs...</div>;

    const history = data?.history || [];

    return (
        <table className="w-full text-left border-collapse border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-all font-semibold text-slate-600 tracking-tight">
            <thead className="bg-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Trigger</th>
                    <th className="px-6 py-4">Docs</th>
                    <th className="px-6 py-4">PDFs</th>
                    <th className="px-6 py-4">Status</th>
                </tr>
            </thead>
            <tbody className="text-sm">
                {history.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{format(new Date(row.createdAt), 'dd MMM yyyy')}</div>
                            <div className="text-[11px] font-medium text-slate-400">{format(new Date(row.createdAt), 'HH:mm:ss')}</div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${
                                row.trigger === 'report-submit' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                row.trigger === 'manual' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                row.trigger === 'pre-crash' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                'bg-slate-100 text-slate-700 border-slate-200'
                           }`}>
                            {row.trigger === 'report-submit' ? '⚡ Auto' : 
                             row.trigger === 'pre-crash' ? '🚑 Emergency' : 
                             row.trigger === 'pre-restore' ? '🛡️ Safety' : 
                             row.trigger}
                           </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500 font-bold tracking-tighter">
                            {row.totalDocuments?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500 font-bold tracking-tighter">
                            {row.collections?.pdfs?.count || 0}
                        </td>
                        <td className="px-6 py-4">
                            {row.status === 'success' ? (
                                <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-100/50 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm shadow-emerald-100/50">
                                    ✅ Complete
                                </span>
                            ) : row.status === 'failed' ? (
                                <span className="flex items-center gap-1.5 text-rose-600 bg-rose-100/50 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm shadow-rose-100/50">
                                    ❌ Failed
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-amber-600 bg-amber-100/50 px-3 py-1.5 rounded-lg text-xs font-black animate-pulse">
                                    ⏳ Processing
                                </span>
                            )}
                        </td>
                    </tr>
                ))}
                {history.length === 0 && (
                    <tr>
                         <td colSpan="5" className="px-6 py-10 text-center text-slate-400 italic">No backup history available yet.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default BackupHistoryTable;
