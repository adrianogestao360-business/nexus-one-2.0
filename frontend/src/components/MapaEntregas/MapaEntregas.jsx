import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Box, Typography } from "@mui/material";
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

function MapaEntregas({ rotas = [], altura = 320 }) {
  if (rotas.length === 0) {
    return (
      <Box
        sx={{
          height: altura,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">
          Nenhuma rota em andamento no momento.
        </Typography>
      </Box>
    );
  }

  const centro = [rotas[0].latitude, rotas[0].longitude];

  return (
    <MapContainer
      center={centro}
      zoom={11}
      style={{ height: altura, width: "100%", borderRadius: 12 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {rotas.map((rota) => (
        <Marker
          key={rota.id}
          position={[rota.latitude, rota.longitude]}
          icon={iconePadrao}
        >
          <Popup>
            Rota #{rota.id} — {rota.placa}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapaEntregas;
