import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";

export function useDevices(userId) {
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        if (!userId) {
            setDevices([]);
            return;
        }

        const devicesRef = ref(db, "devices");
        const unsubscribe = onValue(devicesRef, (snapshot) => {
            const data = snapshot.val() || {};
            // Filter devices by userId
            // Assuming structure: devices: { deviceId: { lat, lng, userId, ... } }
            // Or if structure is flat device node (as it was "device"), we need to change DB schema.
            // The current code used "device" (singular) node.
            // We should probably support a list of devices now.

            // If the DB has a single "device" node, we can't really filter.
            // But the plan was to update DB schema to `devices/{deviceId}`.

            // Let's assume we are migrating to `devices` node.
            // If data is just the single device object from before, we might need to handle that.
            // But for new feature, let's assume `devices` is a list/map.

            const userDevices = Object.entries(data)
                .map(([id, device]) => ({ ...device, id }))
                .filter((device) => device.userId === userId);

            setDevices(userDevices);
        });

        return () => unsubscribe();
    }, [userId]);

    return { devices };
}
