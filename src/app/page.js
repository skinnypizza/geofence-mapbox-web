"use client";
import { useEffect, useRef, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import { set, ref as dbRef, remove, update } from "firebase/database";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

export default function Home() {
  mapboxgl.accessToken = "pk.eyJ1Ijoic2tpbm55cGl6emFhIiwiYSI6ImNtaGN1cHNhYzAwc2gybHFiOTdsZ3Y1enAifQ.4gqB2vWF3dSacNfwcdwtlw";

  // ===== REFS =====
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const mapInitializedRef = useRef(false);
  const deviceMarkerRef = useRef(null);
  const alertMarkerRef = useRef(null);
  const drawRef = useRef(null);
  const hoursRef = useRef({ start: "", end: "" });

  // ===== STATES =====
  const [map, setMap] = useState(null);
  const [geofences, setGeofences] = useState([]);
  const [deviceLat, setDeviceLat] = useState(null);
  const [deviceLng, setDeviceLng] = useState(null);
  const [selectedGeofenceId, setSelectedGeofenceId] = useState(null);
  const [hourStart, setHourStart] = useState("");
  const [hourEnd, setHourEnd] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("geofences");

  // ===== EFFECTS: SINCRONIZAR HORAS =====
  useEffect(() => {
    hoursRef.current = { start: hourStart, end: hourEnd };
    console.log("Horas actualizadas:", { start: hourStart, end: hourEnd });
  }, [hourStart, hourEnd]);

  // ===== EFFECTS: OBTENER DISPOSITIVO =====
  useEffect(() => {
    const deviceRef = ref(db, "device");
    const unsubscribe = onValue(
      deviceRef,
      (snapshot) => {
        const data = snapshot.val();
        console.log("Datos del device recibidos:", data);
        if (data && data.lat && data.lng) {
          console.log("Actualizando deviceLat y deviceLng:", data.lat, data.lng);
          setDeviceLat(data.lat);
          setDeviceLng(data.lng);
        }
      },
      (error) => {
        console.error("Error leyendo device:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  // ===== EFFECTS: OBTENER GEOFENCES =====
  useEffect(() => {
    const geofencesRef = dbRef(db, "geofences");
    const unsubscribe = onValue(geofencesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setGeofences(Object.entries(data).map(([id, poligono]) => ({ ...poligono, id })));
    });
    return () => unsubscribe();
  }, []);

  // ===== EFFECTS: OBTENER ALERTAS =====
  useEffect(() => {
    const alertsRef = dbRef(db, "alerts");
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const flat = Object.entries(data).flatMap(([deviceId, perDevice]) =>
        Object.values(perDevice || {}).map((a) => ({
          deviceId,
          type: a.type,
          lat: a.lat,
          lng: a.lng,
          timestamp: a.timestamp,
        }))
      );
      flat.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setAlerts(flat);
    });
    return () => unsubscribe();
  }, []);

 // ===== EFFECTS: INICIALIZAR MAPA (solo una vez) =====
useEffect(() => {
  if (mapInitializedRef.current || !mapContainer.current) return;

  console.log("Inicializando mapa...");

  const mapInstance = new mapboxgl.Map({
    container: mapContainer.current,
    style: "mapbox://styles/mapbox/streets-v12",
    center: [0, 0], // centro temporal hasta que tengamos coordenadas
    zoom: 2,
  });

  mapRef.current = mapInstance;
  mapInitializedRef.current = true;

  mapInstance.on("load", () => {
    console.log("Mapa cargado exitosamente");
  });

  mapInstance.on("error", (e) => {
    console.error("Error en el mapa:", e.error);
  });

  // Crear marcador del dispositivo (si hay coordenadas)
  const deviceMarker = new mapboxgl.Marker({ color: "#10b981" }).addTo(mapInstance);
  deviceMarkerRef.current = deviceMarker;

  // Crear Draw
  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: { polygon: true, trash: true },
  });
  mapInstance.addControl(draw);
  drawRef.current = draw;

  // Handlers de creación y borrado
  const handleDrawCreate = (e) => {
    const poligono = e.features[0];
    const currentStart = hoursRef.current.start;
    const currentEnd = hoursRef.current.end;

    if (!currentStart || !currentEnd) {
      alert("Primero selecciona la hora de inicio y la hora de fin");
      draw.delete(poligono.id);
      return;
    }

    const geofenceId = poligono.id;
    const now = new Date();
    const [startHour, startMin] = currentStart.split(":").map(Number);
    const [endHour, endMin] = currentEnd.split(":").map(Number);
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMin || 0).getTime();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMin || 0).getTime();

    if (end <= start) {
      alert("La hora de fin debe ser después de la hora de inicio.");
      draw.delete(poligono.id);
      return;
    }

    set(dbRef(db, `geofences/${geofenceId}`), { ...poligono, enabled: false, start, end })
      .then(() => {
        alert("Cerca guardada. Ahora selecciónala y haz clic en habilitar.");
        setHourStart("");
        setHourEnd("");
      })
      .catch((err) => {
        alert("Hubo un error al guardar la cerca: " + err.message);
      });
  };

  const handleDrawDelete = (e) => {
    e.features.forEach((feature) => {
      remove(dbRef(db, `geofences/${feature.id}`));
    });
  };

  mapInstance.on("draw.create", handleDrawCreate);
  mapInstance.on("draw.delete", handleDrawDelete);

  // No destruimos el mapa en cleanup, solo limpiamos listeners
  return () => {
    mapInstance.off("draw.create", handleDrawCreate);
    mapInstance.off("draw.delete", handleDrawDelete);
  };
}, []); // <--- sin dependencias


  // ===== EFFECTS: ACTUALIZAR GEOFENCES =====
  useEffect(() => {
    if (!mapRef.current || !drawRef.current) return;

    const allData = drawRef.current.getAll();
    allData.features.forEach((f) => {
      drawRef.current?.delete(f.id);
    });

    geofences.forEach((poligono) => {
      drawRef.current?.add(poligono);
    });
  }, [geofences]);

  // ===== EFFECTS: ACTUALIZAR MARCADOR DISPOSITIVO =====
  useEffect(() => {
    if (mapInitializedRef.current && deviceMarkerRef.current && deviceLat && deviceLng) {
      try {
        deviceMarkerRef.current.setLngLat([deviceLng, deviceLat]);
      } catch (e) {
        console.error("Error actualizando marcador:", e);
      }
    }
  }, [deviceLat, deviceLng]);

  // ===== FUNCIONES =====
  function handleEnableGeofence() {
    if (!selectedGeofenceId) return;
    update(dbRef(db, `geofences/${selectedGeofenceId}`), { enabled: true });
  }

  function handleDisableGeofence(id) {
    update(dbRef(db, `geofences/${id}`), { enabled: false });
  }

  function handleAlertClick(alert) {
    if (!mapRef.current) return;
    try {
      mapRef.current.flyTo({ center: [alert.lng, alert.lat], zoom: 16 });
      if (alertMarkerRef.current) {
        alertMarkerRef.current.remove();
        alertMarkerRef.current = null;
      }
      const m = new mapboxgl.Marker({ color: "#dc2626" })
        .setLngLat([alert.lng, alert.lat])
        .addTo(mapRef.current);
      alertMarkerRef.current = m;
    } catch (e) {
      console.error("Error al mostrar alerta:", e);
    }
  }

  function formatHourRange(start, end) {
    const h = (ms) => {
      const d = new Date(ms);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };
    if (!start || !end) return null;
    return `${h(start)} - ${h(end)}`;
  }

  function formatAlertTime(timestamp) {
    return new Date(timestamp).toLocaleString();
  }

  // ===== DATOS FILTRADOS =====
  const filteredGeofences = geofences.filter((f) =>
    f.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAlerts = alerts.filter(
    (a) =>
      a.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedGeofence = geofences.find((f) => f.id === selectedGeofenceId);

  // ===== JSX =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-green-100 px-8 py-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
            <svg className="text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestor de Geocercas</h1>
            <p className="text-sm text-gray-500">Administra tus cercas activas en tiempo real</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-6 p-8 overflow-hidden h-0">
        {/* Mapa */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="bg-white rounded-xl shadow-md border border-green-100 overflow-hidden flex-1 h-full">
            <div ref={mapContainer} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
          </div>
        </div>

        {/* Panel lateral */}
        <div className="w-96 flex flex-col gap-4 overflow-hidden min-h-0">
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
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "geofences" ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Cercas ({geofences.length})
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "alerts" ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Alertas ({alerts.length})
            </button>
          </div>

          {/* Cercas */}
          {activeTab === "geofences" && (
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
                    onClick={() => setSelectedGeofenceId(f.id)}
                    className={`p-4 cursor-pointer border-b border-green-50 transition-all hover:bg-green-50 ${
                      selectedGeofenceId === f.id ? "bg-green-100 border-l-4 border-l-green-400" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-gray-800 truncate">{f.id}</p>
                      <div className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${
                        f.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
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
          )}

          {/* Alertas */}
          {activeTab === "alerts" && (
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
                    onClick={() => handleAlertClick(a)}
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
          )}

          {/* Acciones */}
          {selectedGeofence && activeTab === "geofences" && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md border border-green-200 p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Acciones</p>
              <button
                onClick={() => handleDisableGeofence(selectedGeofenceId)}
                className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                Desactivar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-green-100 px-8 py-6 shadow-lg">
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
            onClick={handleEnableGeofence}
            disabled={!selectedGeofenceId}
            className={`px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all h-10 ${
              selectedGeofenceId
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
    </div>
  );
}