import { useState } from 'react';
import { CATEGORIES } from '../lib/utils';

const BLANK = {
  name: '', category: 'Theme Park', date: '', time: '',
  location: '', lat: '', lng: '', price: '',
  website: '', ticket_url: '', notes: ''
};

export default function TripModal({ trip, onSave, onClose }) {
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
  } : { ...BLANK });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
          </div>

          <div className="row-2">
            <div className="form-group">
              <label>Latitude</label>
              <input type="number" step="0.0001" value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="52.9886" />
              <span className="hint">Right-click in Google Maps → copy coordinates</span>
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input type="number" step="0.0001" value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="-1.8908" />
            </div>
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
