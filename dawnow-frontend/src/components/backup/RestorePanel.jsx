import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const RestorePanel = () => {
    const [step, setStep] = useState('idle'); // idle | requesting | tokenSent | confirming | done
    const [token, setToken] = useState('');
    const [result, setResult] = useState(null);

    const requestToken = async () => {
        if (!confirm('⚠️ This will send a restore confirmation code to your admin email. Proceed?')) return;
        setStep('requesting');
        try {
            await axios.post('/api/backup/restore/request', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Confirmation code sent to your admin email.');
            setStep('tokenSent');
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to request restore token.');
            setStep('idle');
        }
    };

    const confirmRestore = async () => {
        if (!token.trim()) {
            toast.error('Please enter the confirmation code.');
            return;
        }
        if (!confirm('🚨 FINAL WARNING: This will overwrite production data with backup data. This action cannot be undone. Proceed?')) return;

        setStep('confirming');
        try {
            const { data } = await axios.post('/api/backup/restore/confirm', { confirmationToken: token }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setResult(data);
            toast.success('System restore completed successfully!');
            setStep('done');
        } catch (e) {
            toast.error(e.response?.data?.message || 'Restore failed. Check logs.');
            setStep('tokenSent');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Disaster Recovery Restore
                </h2>
            </div>

            <div className="p-5">
                {step === 'idle' && (
                    <div className="flex flex-col items-center py-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 w-full">
                            <p className="text-amber-800 text-xs font-semibold leading-relaxed">
                                ⚠️ <strong>Use with extreme caution.</strong> System restore replaces all production
                                data with the latest backup snapshot. A confirmation code will be emailed to your
                                admin address.
                            </p>
                        </div>
                        <button
                            onClick={requestToken}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-amber-200 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Request Restore Code
                        </button>
                    </div>
                )}

                {step === 'requesting' && (
                    <div className="py-10 flex flex-col items-center animate-pulse text-amber-600 italic font-semibold">
                        Sending confirmation code to admin email...
                    </div>
                )}

                {step === 'tokenSent' && (
                    <div className="flex flex-col gap-4 py-4">
                        <p className="text-sm text-slate-600 font-medium">
                            Enter the 6-digit confirmation code sent to your admin email:
                        </p>
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Enter confirmation code..."
                            maxLength={10}
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-[0.3em] focus:border-amber-400 focus:ring-4 focus:ring-amber-50 outline-none transition-all"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setStep('idle'); setToken(''); }}
                                className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRestore}
                                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-200 transition-all active:scale-95"
                            >
                                🚨 Confirm Restore
                            </button>
                        </div>
                    </div>
                )}

                {step === 'confirming' && (
                    <div className="py-10 flex flex-col items-center animate-pulse text-rose-600 italic font-semibold">
                        <svg className="w-8 h-8 animate-spin mb-3" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        System restore in progress... Do not close this page.
                    </div>
                )}

                {step === 'done' && (
                    <div className="py-6 text-center">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                            <p className="text-emerald-700 font-bold text-sm">✅ System Restore Completed Successfully</p>
                            {result?.message && (
                                <p className="text-emerald-600 text-xs mt-1">{result.message}</p>
                            )}
                        </div>
                        <button
                            onClick={() => { setStep('idle'); setResult(null); setToken(''); }}
                            className="text-xs font-black uppercase text-slate-500 hover:text-slate-700 tracking-tighter"
                        >
                            Reset Panel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestorePanel;
