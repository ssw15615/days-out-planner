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
  const mapRef = useRef(null);
  const leafRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAndInitMap();
    return () => { if (leafRef.current) { leafRef.current.remove(); leafRef.current = null; } };
  }, []);

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

  function ensureLeaflet(cb) {
    if (window.L) { cb(); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = cb;
    document.head.appendChild(script);
  }

  function buildMap(data) {
    if (!mapRef.current || !window.L) return;
    if (leafRef.current) { leafRef.current.remove(); }

    const pinned = data.filter(t => t.lat && t.lng);
    const center = pinned.length ? [pinned[0].lat, pinned[0].lng] : [52.5, -1.5];

    const m = window.L.map(mapRef.current).setView(center, 6);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(m);

    pinned.forEach(t => {
      const upcoming = isUpcoming(t.date);
      const color = upcoming ? '#2d6a6a' : '#6b7280';

      const icon = window.L.divIcon({
        className: '',
        html: `<div style="background:${color};color:white;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.3);cursor:pointer">${t.name}</div>`,
        iconAnchor: [40, 16]
      });

      const popup = window.L.popup({ maxWidth: 220 }).setContent(
        `<div style="font-family:'DM Sans',sans-serif">
          <strong style="font-size:14px">${t.name}</strong><br>
          <span style="color:#6b7280;font-size:12px">📍 ${t.location || '—'}</span><br>
          <span style="color:#6b7280;font-size:12px">📅 ${t.date || '—'}</span><br>
          ${t.price ? `<span style="color:#6b7280;font-size:12px">💷 ${t.price}</span><br>` : ''}
          <button onclick="window.__navigateToTrip('${t.id}')" style="margin-top:8px;padding:5px 10px;background:#2d6a6a;color:white;border:none;border-radius:6px;font-size:12px;cursor:pointer">View details →</button>
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
