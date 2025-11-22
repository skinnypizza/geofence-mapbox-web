import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";

export function useAlerts() {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const alertsRef = ref(db, "alerts");
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

    return { alerts };
}
