import { useState } from "react";
import GeofenceList from "./GeofenceList";
import AlertList from "./AlertList";

export default function Sidebar({
    geofences,
    alerts,
    selectedGeofenceId,
    onSelectGeofence,
    onDisableGeofence,
    onAlertClick,
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("geofences");

    const selectedGeofence = geofences.find((f) => f.id === selectedGeofenceId);

    return (
        <div className="w-full md:w-96 flex flex-col gap-4 overflow-hidden min-h-0">
            {/* Búsqueda */}
            <div className="bg-white rounded-xl shadow-md border border-green-100 p-4">
                <div className="relative">
                    <svg className="absolute left-3 top-3 text-green-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 bg-green-50 text-sm"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white rounded-xl shadow-md border border-green-100 p-1">
                <button
                    onClick={() => setActiveTab("geofences")}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "geofences" ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-50"
                        }`}
                >
                    Cercas ({geofences.length})
                </button>
                <button
                    onClick={() => setActiveTab("alerts")}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "alerts" ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-50"
                        }`}
                >
                    Alertas ({alerts.length})
                </button>
            </div>

            {/* Contenido */}
            {activeTab === "geofences" && (
                <GeofenceList
                    geofences={geofences}
                    selectedGeofenceId={selectedGeofenceId}
                    onSelect={onSelectGeofence}
                    searchTerm={searchTerm}
                />
            )}

            {activeTab === "alerts" && (
                <AlertList
                    alerts={alerts}
                    onAlertClick={onAlertClick}
                    searchTerm={searchTerm}
                />
            )}

            {/* Acciones */}
            {selectedGeofence && activeTab === "geofences" && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md border border-green-200 p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Acciones</p>
                    <button
                        onClick={() => onDisableGeofence(selectedGeofenceId)}
                        className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                        Desactivar
                    </button>
                </div>
            )}
        </div>
    );
}
