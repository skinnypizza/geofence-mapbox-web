import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";

export function useDevice() {
    const [deviceLat, setDeviceLat] = useState(null);
    const [deviceLng, setDeviceLng] = useState(null);

    useEffect(() => {
        const deviceRef = ref(db, "device");
        const unsubscribe = onValue(
            deviceRef,
            (snapshot) => {
                const data = snapshot.val();
                if (data && data.lat && data.lng) {
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

    return { deviceLat, deviceLng };
}
