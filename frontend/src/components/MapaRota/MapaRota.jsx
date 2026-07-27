import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const iconePadrao = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapaRota({ latitude, longitude, trilha = [] }) {
  const centro = [latitude, longitude];
  const pontosTrilha = trilha.map((p) => [p.latitude, p.longitude]);

  return (
    <MapContainer
      center={centro}
      zoom={14}
      style={{ height: 320, width: "100%", borderRadius: 12 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {pontosTrilha.length > 1 && (
        <Polyline positions={pontosTrilha} color="#2563EB" />
      )}

      <Marker position={centro} icon={iconePadrao}>
        <Popup>Última posição conhecida</Popup>
      </Marker>
    </MapContainer>
  );
}

export default MapaRota;
