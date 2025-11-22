export default function GeofenceList({ geofences, selectedGeofenceId, onSelect, searchTerm }) {
    const filteredGeofences = geofences.filter((f) =>
        f.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    function formatHourRange(start, end) {
        const h = (ms) => {
            const d = new Date(ms);
            return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        };
        if (!start || !end) return null;
        return `${h(start)} - ${h(end)}`;
    }

    return (
        <div className="bg-white rounded-xl shadow-md border border-green-100 overflow-hidden flex flex-col flex-1">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-green-100">
                <h2 className="text-sm font-semibold text-gray-700">Cercas Activas</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredGeofences.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        <p className="text-sm">No hay geocercas</p>
                    </div>
                )}
                {filteredGeofences.map((f) => (
                    <div
                        key={f.id}
                        onClick={() => onSelect(f.id)}
                        className={`p-4 cursor-pointer border-b border-green-50 transition-all hover:bg-green-50 ${selectedGeofenceId === f.id ? "bg-green-100 border-l-4 border-l-green-400" : ""
                            }`}
                    >
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-semibold text-gray-800 truncate">{f.id}</p>
                            <div className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${f.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}>
                                <span className="w-2 h-2 rounded-full bg-current"></span>
                                {f.enabled ? "Activa" : "Inactiva"}
                            </div>
                        </div>
                        {f.start && f.end && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span>{formatHourRange(f.start, f.end)}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
