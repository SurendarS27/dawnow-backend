import React from 'react';

const ProgressBar = ({ value, max = 100, label, color = 'bg-primary-green' }) => {
    const percentage = Math.round((value / max) * 100);
    
    return (
        <div className="w-full mb-4">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <span className="text-sm font-medium text-slate-700">{percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                    className={`${color} h-2.5 rounded-full transition-all duration-500 ease-out`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;
