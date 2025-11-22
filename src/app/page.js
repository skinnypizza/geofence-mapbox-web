"use client";
import { useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import Sidebar from "@/components/Sidebar/Sidebar";
import MapBoard from "@/components/Map/MapBoard";
import { useGeofences } from "@/hooks/useGeofences";
import { useDevices } from "@/hooks/useDevices";
import { useAlerts } from "@/hooks/useAlerts";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

  // Hooks
  const { geofences, saveGeofence, deleteGeofence, enableGeofence, disableGeofence } = useGeofences();
  const { devices } = useDevices(currentUser?.uid);
  const { alerts } = useAlerts();

  // Local State
  const [selectedGeofenceId, setSelectedGeofenceId] = useState(null);
  const [hourStart, setHourStart] = useState("");
  const [hourEnd, setHourEnd] = useState("");

  // Refs (for Map interactions from siblings)
  const mapRef = useRef(null);
  const alertMarkerRef = useRef(null);

  // Handlers
  const handleGeofenceCreate = async (poligono, startStr, endStr) => {
    const geofenceId = poligono.id;
    const now = new Date();
    const [startHour, startMin] = startStr.split(":").map(Number);
    const [endHour, endMin] = endStr.split(":").map(Number);
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMin || 0).getTime();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMin || 0).getTime();

    if (end <= start) {
      throw new Error("La hora de fin debe ser después de la hora de inicio.");
    }

    await saveGeofence(geofenceId, { ...poligono, enabled: false, start, end });
  };

  const handleAlertClick = (alert) => {
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
  };

  if (!currentUser) return null; // Prevent flash of content

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col">
      <Header />

      <div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-8 overflow-hidden md:h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <MapBoard
            geofences={geofences}
            devices={devices}
            hourStart={hourStart}
            hourEnd={hourEnd}
            setHourStart={setHourStart}
            setHourEnd={setHourEnd}
            onGeofenceCreate={handleGeofenceCreate}
            onGeofenceDelete={deleteGeofence}
            mapRef={mapRef}
          />
        </div>

        <Sidebar
          geofences={geofences}
          alerts={alerts}
          selectedGeofenceId={selectedGeofenceId}
          onSelectGeofence={setSelectedGeofenceId}
          onDisableGeofence={disableGeofence}
          onAlertClick={handleAlertClick}
        />
      </div>

      <Footer
        hourStart={hourStart}
        setHourStart={setHourStart}
        hourEnd={hourEnd}
        setHourEnd={setHourEnd}
        onEnableGeofence={() => enableGeofence(selectedGeofenceId)}
        selectedGeofenceId={selectedGeofenceId}
      />
    </div>
  );
}