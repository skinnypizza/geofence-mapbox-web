export default function AlertList({ alerts, onAlertClick, searchTerm }) {
    const filteredAlerts = alerts.filter(
        (a) =>
            a.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    function formatAlertTime(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    return (
        <div className="bg-white rounded-xl shadow-md border border-green-100 overflow-hidden flex flex-col flex-1">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-4 py-3 border-b border-red-100">
                <h2 className="text-sm font-semibold text-gray-700">Alertas Recientes</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredAlerts.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        <p className="text-sm">No hay alertas</p>
                    </div>
                )}
                {filteredAlerts.map((a, idx) => (
                    <div
                        key={`${a.deviceId}-${a.timestamp}-${idx}`}
                        onClick={() => onAlertClick(a)}
                        className="p-4 border-b border-red-50 cursor-pointer hover:bg-red-50 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-semibold text-gray-800 truncate">{a.deviceId}</p>
                            <span className="px-2 py-1 text-xs rounded font-semibold bg-red-100 text-red-700 uppercase whitespace-nowrap">
                                {a.type}
                            </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                            <p>{formatAlertTime(a.timestamp)}</p>
                            <p className="font-mono text-gray-500">
                                {a.lat.toFixed(4)}, {a.lng.toFixed(4)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
