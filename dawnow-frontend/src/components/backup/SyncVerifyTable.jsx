import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const SyncVerifyTable = () => {
    const fetchSync = async () => {
        const { data } = await axios.get('/api/backup/verify', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return data;
    };

    const { data: syncData, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['syncVerify'],
        queryFn: fetchSync,
        enabled: false // Only on demand
    });

    return (
        <div className="p-4">
            {!isLoading && !syncData && (
                <div className="flex flex-col items-center py-10 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium mb-4">Integrity check has not been run in this session.</p>
                    <button 
                        onClick={() => refetch()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-md shadow-indigo-200 transition-all active:scale-95"
                    >
                        🚀 Run Integrity Sync Check
                    </button>
                </div>
            )}

            {(isLoading || isFetching) && (
                <div className="py-20 flex flex-col items-center animate-pulse text-indigo-600 italic font-semibold">
                    Scanning databases... comparison in progress
                </div>
            )}

            {syncData && !isFetching && (
                <table className="w-full text-left border-collapse rounded-xl overflow-hidden shadow-sm">
                    <thead className="bg-slate-100 text-slate-500 text-[10px] uppercase font-black font-mono tracking-widest border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Collection</th>
                            <th className="px-6 py-4">DAW NOW Prod</th>
                            <th className="px-6 py-4">Backup Atlas</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-semibold text-slate-700">
                        {syncData.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all">
                                <td className="px-6 py-4 capitalize">{row.collection}</td>
                                <td className="px-6 py-4 font-mono text-slate-500">{row.prodCount.toLocaleString()}</td>
                                <td className="px-6 py-4 font-mono text-slate-500">{row.backupCount.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    {row.inSync ? (
                                        <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-black ring-1 ring-emerald-200">
                                            ✅ IN SYNC
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-xs font-black ring-1 ring-rose-200">
                                            ❌ OUT OF SYNC
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            
            {syncData && !isFetching && (
                 <div className="mt-4 flex justify-end">
                    <button 
                        onClick={() => refetch()}
                        className="text-xs font-black uppercase text-indigo-600 hover:text-indigo-800 tracking-tighter"
                    >
                        Re-run check
                    </button>
                 </div>
            )}
        </div>
    );
};

export default SyncVerifyTable;
