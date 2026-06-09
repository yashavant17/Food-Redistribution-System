import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';

const donorIcon = new L.divIcon({
  className: 'custom',
  html: `<div style="background:#10b981; color:white; width:24px; height:24px; border-radius:50%; text-align:center; box-shadow:0 0 5px rgba(0,0,0,0.5);">🍔</div>`,
  iconSize: [24, 24]
});

const ngoIcon = new L.divIcon({
  className: 'custom',
  html: `<div style="background:#3b82f6; color:white; width:24px; height:24px; border-radius:50%; text-align:center; box-shadow:0 0 5px rgba(0,0,0,0.5);">🚚</div>`,
  iconSize: [24, 24]
});

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await adminAPI.getDeliveries();
        setDeliveries(res.data.data);
      } catch (error) {
        toast.error('Failed to load tracking data');
      }
    };
    fetchTracking();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Live Delivery Tracking</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', height: 'calc(100vh - 150px)' }}>
        
        {/* Deliveries List */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflowY: 'auto' }}>
          <div style={{ padding: '15px', borderBottom: '1px solid var(--border)', background: '#f8fafc', fontWeight: 600 }}>
            Active / Completed Deliveries
          </div>
          {deliveries.map(dev => (
            <div 
              key={dev._id} 
              onClick={() => setSelectedRoute(dev)}
              style={{ padding: '15px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selectedRoute?._id === dev._id ? '#eff6ff' : 'white' }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>{dev.foodName}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>From: {dev.donor?.name || 'Unknown'}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>To: {dev.acceptedBy?.name || 'Unknown NGO'}</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${dev.status === 'accepted' ? 'accepted' : dev.status === 'picked' ? 'warning' : 'completed'}`}>
                  {dev.status.toUpperCase()}
                </span>
                
                <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'right' }}>
                  {dev.status === 'delivered' && dev.completedAt ? (
                    <div>Delivered: {new Date(dev.completedAt).toLocaleString()}</div>
                  ) : dev.acceptedAt ? (
                    <div>Started: {new Date(dev.acceptedAt).toLocaleString()}</div>
                  ) : (
                    <div>Pending Delivery</div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {deliveries.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No tracking data found</div>}
        </div>

        {/* Live Map */}
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <MapContainer center={[13.111, 77.625]} zoom={11} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {selectedRoute && selectedRoute.donorLocation?.coordinates?.length > 1 && selectedRoute.ngoLocation?.coordinates?.length > 1 && (
              <>
                <Marker position={[selectedRoute.donorLocation.coordinates[1], selectedRoute.donorLocation.coordinates[0]]} icon={donorIcon}>
                  <Popup>Pickup: {selectedRoute.donor?.name}</Popup>
                </Marker>
                
                <Marker position={[selectedRoute.ngoLocation.coordinates[1], selectedRoute.ngoLocation.coordinates[0]]} icon={ngoIcon}>
                  <Popup>Dropoff: {selectedRoute.acceptedBy?.name}</Popup>
                </Marker>

                <Polyline 
                  positions={[
                    [selectedRoute.donorLocation.coordinates[1], selectedRoute.donorLocation.coordinates[0]],
                    [selectedRoute.ngoLocation.coordinates[1], selectedRoute.ngoLocation.coordinates[0]]
                  ]} 
                  color="#3b82f6" weight={3} dashArray="5, 10" 
                />
              </>
            )}
          </MapContainer>
        </div>

      </div>
    </div>
  );
};

export default Deliveries;
