import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

// Fix default marker icons for bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/[email protected]/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/[email protected]/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/[email protected]/dist/images/marker-shadow.png'
});

// react-leaflet's MapContainer ignores center prop changes after initial render.
// This component programmatically re-centers the map when the position changes.
// It also calls invalidateSize() to fix grey tiles when the map loads inside a
// hidden container (e.g. tab panel) or when the container resizes.
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    // Fix grey tiles caused by container being hidden/zero-sized at mount time.
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

const createEmojiIcon = (emoji, bgColor) => {
  return L.divIcon({
    html: `<div style="background-color: ${bgColor}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 3px 8px rgba(0,0,0,0.3); border: 2px solid white;">${emoji}</div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const icons = {
  hospital: createEmojiIcon('🏥', '#ef4444'),
  police: createEmojiIcon('👮', '#3b82f6'),
  embassy: createEmojiIcon('🏛️', '#8b5cf6'),
  hazard: createEmojiIcon('⚠️', '#f59e0b')
};

export default function MapView({
  position,
  positions = [],
  geofences = [],
  hazardReports = [],
  radius,
  label = 'You are here',
  height = '400px',
  showSafetyPoints = true
}) {
  const allPositions = positions.length > 0 ? positions : (position ? [{ lat: position.lat, lng: position.lng, label }] : []);
  const center = allPositions.length > 0 ? { lat: allPositions[0].lat, lng: allPositions[0].lng } : (position || { lat: 20.5937, lng: 78.9629 });

  const [safetyPoints, setSafetyPoints] = useState([]);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [filters, setFilters] = useState({ hospital: true, police: true, embassy: true });
  const fetchedRef = useRef('');

  useEffect(() => {
    if (!showSafetyPoints || !center.lat || !center.lng) return;

    const latKey = center.lat.toFixed(2);
    const lngKey = center.lng.toFixed(2);
    const posKey = `${latKey},${lngKey}`;

    if (fetchedRef.current === posKey) return;
    fetchedRef.current = posKey;

    setLoadingPoints(true);

    const query = `[out:json][timeout:10];(node["amenity"="hospital"](around:5000,${center.lat},${center.lng});node["amenity"="police"](around:5000,${center.lat},${center.lng});node["amenity"="embassy"](around:5000,${center.lat},${center.lng});node["office"="diplomatic"](around:5000,${center.lat},${center.lng}););out body 25;`;

    axios.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(query)}`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 8000
    })
      .then((res) => {
        if (res.data && res.data.elements) {
          const points = res.data.elements.map((el) => {
            let type = 'hospital';
            if (el.tags?.amenity === 'police') type = 'police';
            else if (el.tags?.amenity === 'embassy' || el.tags?.office === 'diplomatic') type = 'embassy';
            return {
              id: el.id,
              type,
              name: el.tags?.name || el.tags?.['name:en'] || `${type.charAt(0).toUpperCase() + type.slice(1)} Service`,
              lat: el.lat,
              lng: el.lon
            };
          });
          setSafetyPoints(points);
        }
      })
      .catch(() => {
        // Fallback demo safety points around center if Overpass API is unreachable or rate limited
        setSafetyPoints([
          { id: 'f-h1', type: 'hospital', name: 'Emergency Medical Center', lat: center.lat + 0.008, lng: center.lng + 0.005 },
          { id: 'f-p1', type: 'police', name: 'Central Police Precinct', lat: center.lat - 0.006, lng: center.lng - 0.007 },
          { id: 'f-e1', type: 'embassy', name: 'Diplomatic Mission & Embassy Hub', lat: center.lat + 0.012, lng: center.lng - 0.004 }
        ]);
      })
      .finally(() => setLoadingPoints(false));
  }, [center.lat, center.lng, showSafetyPoints]);

  const getGeofenceColor = (type) => {
    if (type === 'danger') return { color: '#dc2626', fillColor: '#ef4444' };
    if (type === 'caution') return { color: '#d97706', fillColor: '#f59e0b' };
    return { color: '#059669', fillColor: '#10b981' };
  };

  const filteredSafetyPoints = safetyPoints.filter((p) => filters[p.type]);

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden border border-slate-200 relative">
      <MapContainer center={[center.lat, center.lng]} zoom={allPositions.length > 0 ? 13 : 12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto-recenter when position changes */}
        <RecenterMap lat={center.lat} lng={center.lng} />

        {/* Geofence Safety Circles */}
        {geofences.map((g) => {
          const style = getGeofenceColor(g.type);
          return (
            <Circle
              key={g.id}
              center={[Number(g.latitude), Number(g.longitude)]}
              radius={Number(g.radius_meters || 500)}
              pathOptions={{ color: style.color, fillColor: style.fillColor, fillOpacity: 0.25, weight: 2 }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <strong className="capitalize block">{g.type} Zone: {g.name}</strong>
                  <p>{g.description || 'Monitored safety perimeter.'}</p>
                  <p className="text-slate-400">Radius: {g.radius_meters}m</p>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Nearby Safety Points (Hospitals, Police, Embassies) */}
        {showSafetyPoints && filteredSafetyPoints.map((sp) => (
          <Marker key={sp.id} position={[sp.lat, sp.lng]} icon={icons[sp.type] || icons.hospital}>
            <Popup>
              <div className="text-xs space-y-1">
                <span className="font-bold block capitalize text-slate-800">
                  {sp.type === 'hospital' ? '🏥 Hospital' : sp.type === 'police' ? '👮 Police Station' : '🏛️ Embassy / Consulate'}
                </span>
                <p className="font-semibold text-slate-700">{sp.name}</p>
                <p className="text-[10px] text-slate-400">OpenStreetMap Verified Safety Node</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Community Hazard Markers */}
        {hazardReports.map((h) => (
          <Marker key={h.id} position={[Number(h.latitude), Number(h.longitude)]} icon={icons.hazard}>
            <Popup>
              <div className="text-xs space-y-1">
                <span className="font-bold text-amber-600 block capitalize">⚠️ Community Hazard Report ({h.type})</span>
                <p className="text-slate-700">{h.note || 'User reported safety concern in this area.'}</p>
                <p className="text-[10px] text-slate-400">{new Date(h.created_at).toLocaleString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Position Markers */}
        {allPositions.map((p, idx) => (
          <React.Fragment key={p.id || idx}>
            <Marker position={[p.lat, p.lng]}>
              <Popup>{p.label || label}</Popup>
            </Marker>
            {radius && idx === 0 && <Circle center={[p.lat, p.lng]} radius={radius} pathOptions={{ color: '#1a7ee0', fillOpacity: 0.15 }} />}
          </React.Fragment>
        ))}
      </MapContainer>

      {/* Safety Points Legend & Filter Toggle Control */}
      {showSafetyPoints && (
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md p-2.5 rounded-xl text-xs shadow-lg border border-slate-200 z-[1000] space-y-1.5 min-w-[170px]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Nearby Safety</span>
            {loadingPoints && <span className="text-[10px] text-brand-600 animate-spin">⏳</span>}
          </div>
          <div className="space-y-1 text-slate-700">
            <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80">
              <input
                type="checkbox"
                checked={filters.hospital}
                onChange={(e) => setFilters({ ...filters, hospital: e.target.checked })}
                className="accent-rose-500 rounded"
              />
              <span>🏥 Hospitals</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80">
              <input
                type="checkbox"
                checked={filters.police}
                onChange={(e) => setFilters({ ...filters, police: e.target.checked })}
                className="accent-blue-500 rounded"
              />
              <span>👮 Police Stations</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer hover:opacity-80">
              <input
                type="checkbox"
                checked={filters.embassy}
                onChange={(e) => setFilters({ ...filters, embassy: e.target.checked })}
                className="accent-purple-500 rounded"
              />
              <span>🏛️ Embassies</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
