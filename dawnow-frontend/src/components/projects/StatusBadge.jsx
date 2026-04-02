import React from 'react';

const statusConfig = {
    Prepared: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
    Submitted: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
    Revision: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
    Accepted: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    Published: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
};

const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || statusConfig.Prepared;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
            <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
            {status}
        </span>
    );
};

export default StatusBadge;
