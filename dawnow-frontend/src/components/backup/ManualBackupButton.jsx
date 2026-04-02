import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ManualBackupButton = ({ onTriggered }) => {
    const [loading, setLoading] = useState(false);

    const triggerManual = async () => {
        if (!confirm('This will trigger a full, real-time backup across all Atlas collections. Proceed?')) return;
        
        setLoading(true);
        try {
            await axios.post('/api/backup/trigger', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            onTriggered();
            
            // Disable button for 15s to prevent hammering
            setTimeout(() => setLoading(false), 15000);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Manual backup failed to trigger.');
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={triggerManual}
            disabled={loading}
            className={`px-6 py-2 rounded-xl font-bold text-white shadow-xl transition-all active:scale-95 flex items-center gap-2 
                ${loading ? 'bg-slate-400 cursor-not-allowed opacity-75' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
        >
            {loading ? (
                <>
                    <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sequence Initiated...
                </>
            ) : (
                <>
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Run Full Backup Now
                </>
            )}
        </button>
    );
};

export default ManualBackupButton;
