import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
export function LocationMarker({ locationData, setLocationData }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      setLocationData(prev => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      }));
    },
  });

  if (!locationData.latitude) return null;

  return (
    <Marker position={[locationData.latitude, locationData.longitude]} />
  );
}