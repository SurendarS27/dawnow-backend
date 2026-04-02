import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const STATUS_COLORS = {
    Prepared: '#3b82f6',
    Submitted: '#eab308',
    Revision: '#f97316',
    Accepted: '#22c55e',
    Published: '#a855f7',
};

const PIE_COLORS = ['#16a34a', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const FundingCharts = ({ reportData }) => {
    if (!reportData) return null;

    const { byStatus, byAgency, monthlyData, totalSanctioned, totalReceived, totalPending } = reportData;

    const statusChartData = [
        { name: 'Prepared', count: byStatus?.prepared || 0, fill: STATUS_COLORS.Prepared },
        { name: 'Submitted', count: byStatus?.submitted || 0, fill: STATUS_COLORS.Submitted },
        { name: 'Revision', count: byStatus?.revision || 0, fill: STATUS_COLORS.Revision },
        { name: 'Accepted', count: byStatus?.accepted || 0, fill: STATUS_COLORS.Accepted },
        { name: 'Published', count: byStatus?.published || 0, fill: STATUS_COLORS.Published },
    ];

    const agencyChartData = (byAgency || []).map(a => ({
        name: a.name,
        value: a.total,
        count: a.count,
    }));

    const chartTooltipStyle = {
        borderRadius: '12px',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    };

    return (
        <div className="space-y-6">
            {/* Row 1: Status Bar + Agency Pie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart 1: Projects by Status */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
                    <h3 className="font-bold text-gray-800 mb-4">Projects by Status</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={statusChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip contentStyle={chartTooltipStyle} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Projects">
                                {statusChartData.map((entry, index) => (
                                    <Cell key={index} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart 2: Funding by Agency */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
                    <h3 className="font-bold text-gray-800 mb-4">Funding by Agency</h3>
                    {agencyChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie
                                    data={agencyChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    label={({ name, value }) => `${name}: ₹${(value / 1000).toFixed(0)}K`}
                                    labelLine={true}
                                >
                                    {agencyChartData.map((entry, index) => (
                                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={chartTooltipStyle}
                                    formatter={(value) => [`₹ ${value.toLocaleString('en-IN')}`, 'Amount']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[85%] flex items-center justify-center text-gray-400">
                            No agency data available
                        </div>
                    )}
                </div>
            </div>

            {/* Row 2: Monthly Submissions + Sanctioned vs Received */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart 3: Monthly Project Submissions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
                    <h3 className="font-bold text-gray-800 mb-4">Monthly Project Submissions</h3>
                    {(monthlyData || []).length > 0 ? (
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip contentStyle={chartTooltipStyle} />
                                <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} name="Submissions" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[85%] flex items-center justify-center text-gray-400">
                            No submission data available
                        </div>
                    )}
                </div>

                {/* Chart 4: Sanctioned vs Received (Grouped Bar) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Amount Sanctioned vs Received</h3>
                    <div className="space-y-6 pt-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Total Sanctioned</span>
                                <span className="font-bold text-green-600">&#8377; {(totalSanctioned || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Total Received</span>
                                <span className="font-bold text-blue-600">&#8377; {(totalReceived || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all"
                                    style={{ width: totalSanctioned > 0 ? `${(totalReceived / totalSanctioned) * 100}%` : '0%' }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Total Pending</span>
                                <span className="font-bold text-amber-600">&#8377; {(totalPending || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 rounded-full transition-all"
                                    style={{ width: totalSanctioned > 0 ? `${(totalPending / totalSanctioned) * 100}%` : '0%' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FundingCharts;
