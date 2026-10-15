import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points || points.length === 0) return;

    const heatData = points
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => [
        Number(p.latitude),
        Number(p.longitude),
        p.risk_score != null ? Math.min(1.0, Math.max(0.3, Number(p.risk_score) / 100)) : 0.5
      ]);

    if (heatData.length === 0) return;

    const heatLayer = L.heatLayer(heatData, {
      radius: 30,
      blur: 18,
      maxZoom: 16,
      max: 1.0,
      gradient: {
        0.2: '#3b82f6', // blue
        0.4: '#10b981', // green
        0.6: '#eab308', // yellow
        0.8: '#f97316', // orange
        1.0: '#ef4444'  // red
      }
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

export default function RiskHeatmapView({ points = [], height = '500px' }) {
  const validPoints = points.filter((p) => p.latitude != null && p.longitude != null);
  const center = validPoints.length > 0
    ? [Number(validPoints[0].latitude), Number(validPoints[0].longitude)]
    : [19.0760, 72.8777];

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
      <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <HeatmapLayer points={validPoints} />

        {validPoints.map((p) => (
          <Marker key={p.id} position={[Number(p.latitude), Number(p.longitude)]}>
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-800">{p.location_name || 'Risk Assessment Pin'}</p>
                <p>
                  Risk Score:{' '}
                  <span className={`font-bold ${
                    p.risk_level === 'high' ? 'text-rose-600' :
                    p.risk_level === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {p.risk_score} ({p.risk_level})
                  </span>
                </p>
                <p className="text-slate-400">{new Date(p.created_at).toLocaleString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Heatmap intensity legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl text-xs shadow-md border border-slate-200 z-[1000] flex items-center gap-2">
        <span className="font-semibold text-slate-700">Risk Intensity:</span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-500">Low</span>
          <div className="w-20 h-3 rounded bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 via-orange-500 to-red-500"></div>
          <span className="text-[10px] text-slate-500">High</span>
        </div>
      </div>
    </div>
  );
}
