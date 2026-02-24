import { useMap } from "react-leaflet";
import { useEffect } from "react";

export function FlyToLocation({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (!latitude || !longitude) return;

    map.flyTo([latitude, longitude], 15, {
      animate: true,
      duration: 1.2,
    });
  }, [latitude, longitude]);

  return null;
}