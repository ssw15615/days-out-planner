import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../lib/AuthContext';
import { uploadTripPhoto } from '../lib/firebaseDb';
import { CATEGORIES } from '../lib/utils';

const BLANK = {
  name: '', category: 'Theme Park', date: '', time: '',
  location: '', lat: '', lng: '', price: '',
  website: '', ticket_url: '', notes: '', photoUrl: ''
};

export default function TripModal({ trip, onSave, onClose }) {
  const { session } = useAuth();
  const [form, setForm] = useState(trip ? {
    name: trip.name || '',
    category: trip.category || 'Theme Park',
    date: trip.date || '',
    time: trip.time || '',
    location: trip.location || '',
    lat: trip.lat || '',
    lng: trip.lng || '',
    price: trip.price || '',
    website: trip.website || '',
    ticket_url: trip.ticket_url || '',
    notes: trip.notes || '',
    photoUrl: trip.photoUrl || '',
  } : { ...BLANK });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState('');

  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const term = form.location.trim();
    if (!term || term.length < 3) {
      setSearchResults([]);
      setSearchError('');
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError('');
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=0&limit=5&countrycodes=gb&q=${encodeURIComponent(term)}`
        );
        const results = await response.json();
        setSearchResults(results.map(r => ({
          id: r.place_id,
          name: r.display_name,
          lat: r.lat,
          lng: r.lon,
        })));
      } catch (e) {
        setSearchError('Location search failed');
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.location]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = L.map(mapContainer.current, {
      center: form.lat && form.lng ? [parseFloat(form.lat), parseFloat(form.lng)] : [52.5, -1.5],
      zoom: form.lat && form.lng ? 12 : 6,
      scrollWheelZoom: false,
      dragging: true,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', (e) => {
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      set('lat', lat);
      set('lng', lng);
      setMapMarker(e.latlng, map);
    });

    mapInstance.current = map;
    if (form.lat && form.lng) setMapMarker({ lat: parseFloat(form.lat), lng: parseFloat(form.lng) }, map);

    return () => {
      map.remove();
      mapInstance.current = null;
      markerInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    if (form.lat && form.lng) {
      const position = { lat: parseFloat(form.lat), lng: parseFloat(form.lng) };
      setMapMarker(position, mapInstance.current);
      mapInstance.current.setView(position, 12);
    } else if (markerInstance.current) {
      mapInstance.current.removeLayer(markerInstance.current);
      markerInstance.current = null;
    }
  }, [form.lat, form.lng]);

  function setMapMarker(position, map) {
    if (markerInstance.current) {
      markerInstance.current.setLatLng(position);
    } else {
      markerInstance.current = L.circleMarker(position, {
        radius: 8,
        color: '#1d4ed8',
        fillColor: '#3b82f6',
        fillOpacity: 0.9,
      }).addTo(map);
    }
  }

  function applyLocationSuggestion(result) {
    set('location', result.name);
    set('lat', result.lat);
    set('lng', result.lng);
    setSearchResults([]);
    if (mapInstance.current) {
      const position = { lat: parseFloat(result.lat), lng: parseFloat(result.lng) };
      mapInstance.current.setView(position, 12);
      setMapMarker(position, mapInstance.current);
    }
  }

  async function handleFileUpload(file) {
    if (!session?.user?.uid || !file) return;
    setPhotoUploadError('');
    setPhotoUploading(true);
    try {
      const url = await uploadTripPhoto(file, session.user.uid);
      set('photoUrl', url);
    } catch (e) {
      setPhotoUploadError('Photo upload failed. Try a smaller file or another image.');
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Trip name is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({
        ...form,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
      });
      onClose();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{trip ? 'Edit trip' : 'Add a new trip'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label>Trip name *</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Alton Towers Adventure" />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="row-2">
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Location name</label>
            <input type="text" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Alton, Staffordshire" />
            <small className="hint">Search and choose a location, or click on the map below.</small>
            {searchLoading && <div className="hint">Searching locations…</div>}
            {searchError && <div className="auth-error" style={{ marginTop: '0.75rem' }}>{searchError}</div>}
            {searchResults.length > 0 && (
              <div className="location-suggestions">
                {searchResults.map(result => (
                  <button
                    key={result.id}
                    type="button"
                    className="location-suggestion"
                    onClick={() => applyLocationSuggestion(result)}
                  >
                    <strong>{result.name.split(',')[0]}</strong>
                    <div>{result.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="row-2">
            <div className="form-group">
              <label>Latitude</label>
              <input type="number" step="0.0001" value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="52.9886" />
              <span className="hint">Click the map to pick the location.</span>
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input type="number" step="0.0001" value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="-1.8908" />
            </div>
          </div>

          <div className="form-group">
            <div style={{ marginBottom: '0.75rem', fontWeight: 600 }}>Location picker</div>
            <div ref={mapContainer} style={{ width: '100%', minHeight: '220px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #d1d5db' }} />
            <div className="hint">Tap or click the map to set coordinates.</div>
          </div>

          <div className="form-group">
            <label>Trip photo</label>
            {form.photoUrl && (
              <div className="photo-preview" style={{ backgroundImage: `url(${form.photoUrl})` }} />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={e => handleFileUpload(e.target.files?.[0])}
            />
            <input
              type="url"
              value={form.photoUrl}
              onChange={e => set('photoUrl', e.target.value)}
              placeholder="or paste an image URL"
            />
            <small className="hint">
              {photoUploading ? 'Uploading photo…' : 'Upload an image or paste a URL to show on the trip.'}
            </small>
            {photoUploadError && <div className="auth-error" style={{ marginTop: '0.75rem' }}>{photoUploadError}</div>}
          </div>

          <div className="form-group">
            <label>Price per person</label>
            <input type="text" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. £25 or Free" />
          </div>

          <div className="form-group">
            <label>Website URL</label>
            <input type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
          </div>

          <div className="form-group">
            <label>Ticket purchase URL</label>
            <input type="url" value={form.ticket_url} onChange={e => set('ticket_url', e.target.value)} placeholder="https://..." />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Tips, things to bring, things to remember..." />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : (trip ? 'Save changes' : 'Add trip')}
          </button>
        </div>
      </div>
    </div>
  );
}
