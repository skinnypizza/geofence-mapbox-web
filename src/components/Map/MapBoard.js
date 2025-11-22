import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

export default function MapBoard({
    geofences,
    devices = [], // Array of { id, lat, lng, ... }
    hourStart,
    hourEnd,
    onGeofenceCreate,
    onGeofenceDelete,
    mapRef,
    setHourStart,
    setHourEnd,
}) {
    const mapContainer = useRef(null);
    const mapInitializedRef = useRef(false);
    const markersRef = useRef({}); // Store markers by device ID
    const mapCenteredRef = useRef(false);
    const drawRef = useRef(null);
    const hoursRef = useRef({ start: "", end: "" });

    // Update hours ref for event listeners
    useEffect(() => {
        hoursRef.current = { start: hourStart, end: hourEnd };
    }, [hourStart, hourEnd]);

    // Initialize Map
    useEffect(() => {
        if (mapInitializedRef.current || !mapContainer.current) return;

        mapboxgl.accessToken = "pk.eyJ1Ijoic2tpbm55cGl6emFhIiwiYSI6ImNtaGN1cHNhYzAwc2gybHFiOTdsZ3Y1enAifQ.4gqB2vWF3dSacNfwcdwtlw";

        const mapInstance = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [0, 0],
            zoom: 2,
        });

        if (mapRef) mapRef.current = mapInstance;
        mapInitializedRef.current = true;

        // Draw Control
        const draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: { polygon: true, trash: true },
        });
        mapInstance.addControl(draw);
        drawRef.current = draw;

        // Handlers
        const handleDrawCreate = (e) => {
            const poligono = e.features[0];
            const { start, end } = hoursRef.current;

            if (!start || !end) {
                alert("Primero selecciona la hora de inicio y la hora de fin");
                draw.delete(poligono.id);
                return;
            }

            onGeofenceCreate(poligono, start, end)
                .then(() => {
                    alert("Cerca guardada. Ahora selecciónala y haz clic en habilitar.");
                    setHourStart("");
                    setHourEnd("");
                })
                .catch((err) => {
                    alert("Hubo un error al guardar la cerca: " + err.message);
                    draw.delete(poligono.id);
                });
        };

        const handleDrawDelete = (e) => {
            e.features.forEach((feature) => {
                onGeofenceDelete(feature.id);
            });
        };

        mapInstance.on("draw.create", handleDrawCreate);
        mapInstance.on("draw.delete", handleDrawDelete);

        return () => {
            mapInstance.off("draw.create", handleDrawCreate);
            mapInstance.off("draw.delete", handleDrawDelete);
        };
    }, []);

    // Sync Geofences with Draw
    useEffect(() => {
        if (!drawRef.current) return;

        const allData = drawRef.current.getAll();
        allData.features.forEach((f) => {
            drawRef.current?.delete(f.id);
        });

        geofences.forEach((poligono) => {
            drawRef.current?.add(poligono);
        });
    }, [geofences]);

    // Update Device Markers
    useEffect(() => {
        if (!mapRef?.current) return;

        // 1. Remove markers for devices that are no longer present
        Object.keys(markersRef.current).forEach((id) => {
            if (!devices.find((d) => d.id === id)) {
                markersRef.current[id].remove();
                delete markersRef.current[id];
            }
        });

        // 2. Add or update markers
        devices.forEach((device) => {
            if (!device.lat || !device.lng) return;

            if (markersRef.current[device.id]) {
                // Update existing
                markersRef.current[device.id].setLngLat([device.lng, device.lat]);
            } else {
                // Create new
                const marker = new mapboxgl.Marker({ color: "#10b981" })
                    .setLngLat([device.lng, device.lat])
                    .setPopup(new mapboxgl.Popup().setHTML(`<p>${device.id}</p>`)) // Optional: show ID
                    .addTo(mapRef.current);
                markersRef.current[device.id] = marker;
            }
        });

        // 3. Center map on first device if not centered yet
        if (!mapCenteredRef.current && devices.length > 0) {
            const first = devices[0];
            if (first.lat && first.lng) {
                mapRef.current.flyTo({
                    center: [first.lng, first.lat],
                    zoom: 15,
                    duration: 2000,
                });
                mapCenteredRef.current = true;
            }
        }
    }, [devices]);

    return (
        <div className="bg-white rounded-xl shadow-md border border-green-100 overflow-hidden h-80 md:h-full">
            <div ref={mapContainer} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
        </div>
    );
}
