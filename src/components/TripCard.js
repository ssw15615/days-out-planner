import { useNavigate } from 'react-router-dom';
import { fmtDate, isUpcoming, catBadge, buildGCalUrl } from '../lib/utils';
import { deleteTrip } from '../lib/supabase';
import { toast } from '../lib/toast';
import { useAuth } from '../lib/AuthContext';

const CalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" style={{width:14,height:14,stroke:'currentColor'}}>
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" style={{width:14,height:14,stroke:'var(--teal)'}}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" style={{width:14,height:14,stroke:'var(--teal)'}}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const PoundIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" style={{width:14,height:14,stroke:'var(--teal)'}}>
    <circle cx="12" cy="12" r="10"/><path d="M9 12h6M9 15h5M10 9c0-1.1.9-2 2-2s2 .9 2 2v6"/>
  </svg>
);

export default function TripCard({ trip, onEdit, onDeleted }) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const upcoming = isUpcoming(trip.date);

  async function handleDelete(e) {
    e.stopPropagation();
    if (!window.confirm('Delete this trip?')) return;
    try {
      await deleteTrip(trip.id);
      toast('Trip deleted');
      onDeleted();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  function handleGCal(e) {
    e.stopPropagation();
    const url = buildGCalUrl(trip);
    if (!url) { toast('Add a date first', 'error'); return; }
    window.open(url, '_blank');
    toast('Opening Google Calendar…', 'success');
  }

  return (
    <div className="trip-card" onClick={() => navigate(`/trips/${trip.id}`)}>
      <div className={`trip-card-banner ${upcoming ? 'upcoming' : 'past'}`} />
      <div className="trip-card-body">
        <div className="trip-name">{trip.name}</div>
        <div className="trip-meta">
          <span className={`badge ${catBadge(trip.category)}`}>{trip.category || 'Day Out'}</span>
          {upcoming
            ? <span className="badge badge-green">Upcoming</span>
            : <span className="badge badge-gray">Past</span>
          }
          {isAdmin && trip.profiles?.name && (
            <span className="badge badge-gray" style={{fontSize:'10px'}}>{trip.profiles.name}</span>
          )}
        </div>
        {trip.date && (
          <div className="trip-row">
            <CalIcon />
            {fmtDate(trip.date)}{trip.time ? ` · ${trip.time}` : ''}
          </div>
        )}
        {trip.location && (
          <div className="trip-row"><PinIcon />{trip.location}</div>
        )}
        {trip.price && (
          <div className="trip-row"><PoundIcon />{trip.price} per person</div>
        )}
      </div>
      <div className="trip-card-actions" onClick={e => e.stopPropagation()}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/trips/${trip.id}`)}>Details</button>
        <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); onEdit(trip); }}>Edit</button>
        {upcoming && (
          <button className="btn btn-gold btn-sm" onClick={handleGCal}>
            <ClockIcon /> Google Cal
          </button>
        )}
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
}
