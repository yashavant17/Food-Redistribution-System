import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapView.css';

// Fix default marker icons for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom markers using pure CSS and Emojis
const donorIcon = new L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #2E7D32; color: white; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 18px;">🍔</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18]
});

const userIcon = new L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #1976D2; color: white; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 18px;">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18]
});

const urgentIcon = new L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #D32F2F; color: white; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.6); font-size: 18px;">⚠️</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18]
});

const FitBounds = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);

  return null;
};

const DonationMap = ({ donations = [], userLocation = null, height = '400px' }) => {
  const defaultCenter = [20.5937, 78.9629]; // India center
  const center = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : defaultCenter;

  const markers = donations
    .filter(d => d.location?.coordinates?.[0] && d.location?.coordinates?.[1])
    .map(d => ({
      lat: d.location.coordinates[1],
      lng: d.location.coordinates[0],
      donation: d
    }));

  const isExpiringSoon = (expiryTime) => {
    const diff = new Date(expiryTime) - new Date();
    return diff > 0 && diff < 6 * 60 * 60 * 1000;
  };

  return (
    <div className="map-wrapper" style={{ height }} id="donation-map">
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.length > 0 && <FitBounds markers={markers} />}

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <strong>📍 You are here</strong>
            </Popup>
          </Marker>
        )}

        {/* Donation markers */}
        {markers.map((m, idx) => (
          <Marker
            key={m.donation._id || idx}
            position={[m.lat, m.lng]}
            icon={isExpiringSoon(m.donation.expiryTime) ? urgentIcon : donorIcon}
          >
            <Popup>
              <div className="map-popup">
                <h4>{m.donation.foodName}</h4>
                <p>🍽 {m.donation.quantity} {m.donation.unit || 'servings'}</p>
                <p>📍 {m.donation.address}</p>
                <p>⏳ Expires: {new Date(m.donation.expiryTime).toLocaleString()}</p>
                {m.donation.distanceKm && (
                  <p>🗺 {m.donation.distanceKm.toFixed(1)} km away</p>
                )}
                <span className={`badge badge-${m.donation.status}`}>
                  {m.donation.status}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DonationMap;
