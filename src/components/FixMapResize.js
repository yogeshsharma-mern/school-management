import { useMap } from "react-leaflet";
import { useEffect } from "react";

export default function FixMapResize({ trigger }) {
  const map = useMap();

  useEffect(() => {
    if (!trigger) return;

    // SMALL delay is CRITICAL
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 300); // ← magic number for modals

    return () => clearTimeout(t);
  }, [trigger, map]);

  return null;
}