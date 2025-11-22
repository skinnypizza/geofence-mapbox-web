export default function Footer({
    hourStart,
    setHourStart,
    hourEnd,
    setHourEnd,
    onEnableGeofence,
    selectedGeofenceId,
}) {
    return (
        <div className="bg-white border-t border-green-100 px-4 md:px-8 py-4 md:py-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                <div>
                    <label htmlFor="hour-start" className="block text-sm font-semibold text-gray-700 mb-2">
                        Hora de Inicio
                    </label>
                    <input
                        id="hour-start"
                        type="time"
                        value={hourStart}
                        onChange={(e) => setHourStart(e.target.value)}
                        className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 bg-green-50"
                    />
                </div>

                <div>
                    <label htmlFor="hour-end" className="block text-sm font-semibold text-gray-700 mb-2">
                        Hora de Fin
                    </label>
                    <input
                        id="hour-end"
                        type="time"
                        value={hourEnd}
                        onChange={(e) => setHourEnd(e.target.value)}
                        className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 bg-green-50"
                    />
                </div>

                <button
                    onClick={onEnableGeofence}
                    disabled={!selectedGeofenceId}
                    className={`px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all h-10 ${selectedGeofenceId
                            ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:shadow-lg hover:scale-105"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Habilitar
                </button>

                <div className="text-xs text-gray-500 text-center md:col-span-2">
                    <p className="font-medium">Dibuja un polígono, configura horarios y actívalo</p>
                </div>
            </div>
        </div>
    );
}
