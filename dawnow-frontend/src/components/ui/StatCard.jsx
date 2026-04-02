const StatCard = ({ title, value, icon: Icon, color = 'green' }) => {
    const colors = {
        green: 'bg-green-50 text-primary-green',
        blue: 'bg-blue-50 text-brand-blue',
        amber: 'bg-amber-50 text-amber-600',
        red: 'bg-red-50 text-red-600',
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${colors[color] || colors.green}`}>
                    {Icon && <Icon size={24} />}
                </div>
            </div>
        </div>
    )
}

export default StatCard
