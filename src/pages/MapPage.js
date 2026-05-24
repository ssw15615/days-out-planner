import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getTrips } from '../lib/supabase';
import { toast } from '../lib/toast';
import { isUpcoming } from '../lib/utils';
import Navbar from '../components/Navbar';

export default function MapPage() {
  const { session, isAdmin } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState('streets');
  const mapRef = useRef(null);
  const leafRef = useRef(null);
  const tileLayerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAndInitMap();
    return () => { if (leafRef.current) { leafRef.current.remove(); leafRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!leafRef.current || !tileLayerRef.current) return;
    const map = leafRef.current;
    map.removeLayer(tileLayerRef.current);
    tileLayerRef.current = window.L.tileLayer(getTileUrl(mapStyle), {
      attribution: getTileAttribution(mapStyle)
    }).addTo(map);
  }, [mapStyle]);

  async function loadAndInitMap() {
    try {
      const data = await getTrips(session.user.id, isAdmin);
      setTrips(data);
      setLoading(false);
      ensureLeaflet(() => setTimeout(() => buildMap(data), 100));
    } catch (err) {
      toast(err.message, 'error');
      setLoading(false);
    }
  }

  function getTileUrl(style) {
    return style === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  }

  function getTileAttribution(style) {
    return style === 'satellite'
      ? 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
      : '© OpenStreetMap contributors';
  }

  function fixLeafletDefaultIcons() {
    if (!window.L || !window.L.Icon || !window.L.Icon.Default) return;
    window.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }

  function ensureLeaflet(cb) {
    if (window.L) { fixLeafletDefaultIcons(); cb(); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => { fixLeafletDefaultIcons(); cb(); };
    document.head.appendChild(script);
  }

  function buildMap(data) {
    if (!mapRef.current || !window.L) return;
    if (leafRef.current) { leafRef.current.remove(); }

    const pinned = data.filter(t => t.lat && t.lng);
    const center = pinned.length ? [pinned[0].lat, pinned[0].lng] : [52.5, -1.5];

    const m = window.L.map(mapRef.current).setView(center, 6);
    tileLayerRef.current = window.L.tileLayer(getTileUrl(mapStyle), {
      attribution: getTileAttribution(mapStyle)
    }).addTo(m);

    pinned.forEach(t => {
      const upcoming = isUpcoming(t.date);
      const color = upcoming ? '#2d6a6a' : '#6b7280';

      const icon = window.L.divIcon({
        className: 'trip-map-pin',
        html: `
          <div class="trip-pin-body" style="background:${color};">
            <span>${t.name}</span>
          </div>
          <div class="trip-pin-tail" style="border-top-color:${color};"></div>
        `,
        iconSize: [160, 44],
        iconAnchor: [80, 44],
        popupAnchor: [0, -48]
      });

      const popup = window.L.popup({ maxWidth: 240 }).setContent(
        `<div style="font-family:'DM Sans',sans-serif;line-height:1.4;max-width:220px">
          <strong style="font-size:14px;display:block;margin-bottom:6px">${t.name}</strong>
          <div style="color:#374151;font-size:13px;margin-bottom:4px">📍 ${t.location || 'No location'}</div>
          <div style="color:#374151;font-size:13px;margin-bottom:4px">📅 ${t.date || 'No date'}</div>
          ${t.price ? `<div style="color:#374151;font-size:13px;margin-bottom:6px">💷 ${t.price}</div>` : ''}
          <button onclick="window.__navigateToTrip('${t.id}')" style="margin-top:8px;padding:7px 12px;background:#1d4ed8;color:white;border:none;border-radius:8px;font-size:12px;cursor:pointer">View details →</button>
        </div>`
      );

      window.L.marker([t.lat, t.lng], { icon }).addTo(m).bindPopup(popup);
    });

    if (pinned.length > 1) {
      const group = window.L.featureGroup(pinned.map(t => window.L.marker([t.lat, t.lng])));
      m.fitBounds(group.getBounds().pad(0.2));
    }

    leafRef.current = m;
  }

  // Bridge for popup button clicks
  useEffect(() => {
    window.__navigateToTrip = (id) => navigate(`/trips/${id}`);
    return () => { delete window.__navigateToTrip; };
  }, [navigate]);

  const pinned = trips.filter(t => t.lat && t.lng);

  return (
    <>
      <Navbar />
      <div className="main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Map View</h1>
            <p className="page-subtitle">
              {pinned.length} pinned location{pinned.length !== 1 ? 's' : ''}
              {trips.length - pinned.length > 0 && ` · ${trips.length - pinned.length} without coordinates`}
            </p>
          </div>
          <div>
            <label htmlFor="map-style" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--muted)' }}>Map style</label>
            <select
              id="map-style"
              value={mapStyle}
              onChange={e => setMapStyle(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'white', color: 'var(--text)', minWidth: '170px' }}
            >
              <option value="streets">Normal map</option>
              <option value="satellite">Satellite</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" />Loading map…</div>
        ) : (
          <>
            <div ref={mapRef} className="map-page-container" />
            {trips.length > 0 && pinned.length === 0 && (
              <p style={{ marginTop: '1rem', color: 'var(--muted)', fontSize: '14px', textAlign: 'center' }}>
                Add latitude &amp; longitude to your trips to see them on the map.
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
