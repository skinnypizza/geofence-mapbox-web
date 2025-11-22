import { useState, useEffect } from "react";
import { ref, onValue, set, remove, update } from "firebase/database";
import { db } from "../lib/firebase";

export function useGeofences() {
  const [geofences, setGeofences] = useState([]);

  useEffect(() => {
    const geofencesRef = ref(db, "geofences");
    const unsubscribe = onValue(geofencesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setGeofences(Object.entries(data).map(([id, poligono]) => ({ ...poligono, id })));
    });
    return () => unsubscribe();
  }, []);

  const saveGeofence = async (id, data) => {
    return set(ref(db, `geofences/${id}`), data);
  };

  const deleteGeofence = async (id) => {
    return remove(ref(db, `geofences/${id}`));
  };

  const enableGeofence = async (id) => {
    return update(ref(db, `geofences/${id}`), { enabled: true });
  };

  const disableGeofence = async (id) => {
    return update(ref(db, `geofences/${id}`), { enabled: false });
  };

  return { geofences, saveGeofence, deleteGeofence, enableGeofence, disableGeofence };
}
