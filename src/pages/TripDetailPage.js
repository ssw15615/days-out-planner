import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getTripById, updateTrip } from '../lib/firebaseDb';
import { toast } from '../lib/toast';
import { fmtDate, isUpcoming, catBadge, buildGCalUrl, buildGMapsUrl } from '../lib/utils';
import TripModal from '../components/TripModal';
import Navbar from '../components/Navbar';

export default function TripDetailPage() {
  const { id } = useParams();
  const { session, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const mapRef = useRef(null);
  const leafRef = useRef(null);

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (!trip?.lat || !trip?.lng) return;
    // Lazy-load Leaflet for the detail map
    function fixLeafletDefaultIcons() {
      if (!window.L || !window.L.Icon || !window.L.Icon.Default) return;
      window.L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    }

    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => { fixLeafletDefaultIcons(); initMap(); };
      document.head.appendChild(script);
    } else {
      fixLeafletDefaultIcons();
      setTimeout(initMap, 100);
    }
  }, [trip]);

  function initMap() {
    if (!mapRef.current || !trip?.lat || !window.L) return;
    if (leafRef.current) { leafRef.current.remove(); }
    const m = window.L.map(mapRef.current).setView([trip.lat, trip.lng], 13);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(m);
    window.L.marker([trip.lat, trip.lng]).addTo(m)
      .bindPopup(`<b>${trip.name}</b><br>${trip.location || ''}`).openPopup();
    leafRef.current = m;
  }

  async function load() {
    setLoading(true);
    try {
      const found = await getTripById(id);
      if (!found || (!isAdmin && found.userId !== session.user.uid)) {
        navigate('/trips');
        return;
      }
      setTrip(found);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(form) {
    await updateTrip(id, form);
    toast('Trip updated ✓', 'success');
    load();
  }

  function handleGCal() {
    const url = buildGCalUrl(trip);
    if (!url) { toast('Add a date to this trip first', 'error'); return; }
    window.open(url, '_blank');
    toast('Opening Google Calendar…', 'success');
  }

  function handleGMaps() {
    const url = buildGMapsUrl(trip);
    if (!url) { toast('Add a location or map coordinates to this trip first', 'error'); return; }
    window.open(url, '_blank');
    toast('Opening Google Maps…', 'success');
  }

  if (loading) return (
    <><Navbar /><div className="main"><div className="loading"><div className="spinner" />Loading…</div></div></>
  );
  if (!trip) return null;

  const upcoming = isUpcoming(trip.date);

  return (
    <>
      <Navbar />
      <div className="main">
        <button className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }} onClick={() => navigate('/trips')}>
          ← Back to trips
        </button>

        {trip.photoUrl && (
          <div className="detail-photo" style={{ backgroundImage: `url(${trip.photoUrl})` }} />
        )}

        <div className="detail-hero">
          <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '0.5rem' }}>
            <span className={`badge ${catBadge(trip.category)}`}>{trip.category || 'Day Out'}</span>
            {' '}
            {upcoming
              ? <span className="badge badge-green">Upcoming</span>
              : <span className="badge badge-gray">Past</span>
            }
          </div>
          <h1>{trip.name}</h1>
          {trip.location && <p style={{ opacity: 0.8, marginTop: '0.25rem' }}>📍 {trip.location}</p>}
        </div>

        <div className="detail-grid">
          {trip.date && (
            <div className="detail-card">
              <div className="detail-label">Date &amp; time</div>
              <div className="detail-val">📅 {fmtDate(trip.date)}{trip.time ? ` · ${trip.time}` : ''}</div>
            </div>
          )}
          {trip.price && (
            <div className="detail-card">
              <div className="detail-label">Price per person</div>
              <div className="detail-val">💷 {trip.price}</div>
            </div>
          )}
          {trip.location && (
            <div className="detail-card">
              <div className="detail-label">Location</div>
              <div className="detail-val">📍 {trip.location}</div>
            </div>
          )}
        </div>

        {trip.notes && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="detail-label">Notes</div>
            <p style={{ fontSize: '14px', marginTop: '6px', lineHeight: '1.6' }}>{trip.notes}</p>
          </div>
        )}

        <div className="detail-actions">
          {trip.website && (
            <a href={trip.website} target="_blank" rel="noreferrer" className="btn btn-outline">
              🌐 Visit website
            </a>
          )}
          {trip.ticket_url && (
            <a href={trip.ticket_url} target="_blank" rel="noreferrer" className="btn btn-primary">
              🎟️ Buy tickets
            </a>
          )}
          {trip.location && (
            <button className="btn btn-primary" onClick={handleGMaps}>
              🧭 Navigate with Google Maps
            </button>
          )}
          {upcoming && (
            <button className="btn btn-gold" onClick={handleGCal}>
              📅 Add to Google Calendar
            </button>
          )}
          <button className="btn btn-outline" onClick={() => setEditing(true)}>
            ✏️ Edit trip
          </button>
        </div>

        {trip.lat && trip.lng && (
          <div ref={mapRef} className="detail-map" />
        )}
      </div>

      {editing && (
        <TripModal trip={trip} onSave={handleSave} onClose={() => setEditing(false)} />
      )}
    </>
  );
}
