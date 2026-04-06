import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, RefreshCw, Database } from 'lucide-react';

const FallbackBanner = () => {
    const [isApiDown, setIsApiDown] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const checkApiStatus = async () => {
        try {
            const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '') + '/api';
            await axios.get(`${API_URL}/health`, { timeout: 20000 });
            setIsApiDown(false);
        } catch (error) {
            console.error("Health check failed:", error);
            setIsApiDown(true);
        }
    };

    useEffect(() => {
        checkApiStatus();
        const interval = setInterval(checkApiStatus, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [retryCount]);

    if (!isApiDown) return null;

    return (
        <div className="bg-amber-600 text-white p-3 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl z-[9999] border-b border-amber-500 animate-in fade-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3">
                <div className="bg-amber-500/50 p-2 rounded-full hidden sm:block">
                    <Database size={24} className="text-amber-50" />
                </div>
                <div>
                    <h3 className="font-bold flex items-center gap-2 text-sm sm:text-base">
                        <AlertCircle size={18} className="animate-pulse" />
                        SYSTEM IN FALLBACK MODE
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-50 opacity-90">
                        Primary server is currently unreachable. You are browsing a read-only historical cache.
                    </p>
                </div>
            </div>
            
            <button 
                onClick={() => {
                    setRetryCount(prev => prev + 1);
                    checkApiStatus();
                }}
                className="flex items-center gap-2 bg-white text-amber-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-50 transition-all shadow-sm active:scale-95"
            >
                <RefreshCw size={16} className={retryCount > 0 ? "animate-spin" : ""} />
                RECONNECT NOW
            </button>
        </div>
    );
};

export default FallbackBanner;
