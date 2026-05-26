import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getUserTrips, addTrip, updateTrip } from '../lib/firebaseDb';
import { toast } from '../lib/toast';
import { isUpcoming } from '../lib/utils';
import TripCard from '../components/TripCard';
import TripModal from '../components/TripModal';
import Navbar from '../components/Navbar';

export default function TripsPage() {
  const { session, isAdmin } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | trip object
  const [viewMode, setViewMode] = useState('list');
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getUserTrips(session.user.uid, isAdmin);
      setTrips(data);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(form) {
    if (modal === 'add') {
      await addTrip({ ...form, userId: session.user.uid });
      toast('Trip added! 🎉', 'success');
    } else {
      await updateTrip(modal.id, form);
      toast('Trip updated ✓', 'success');
    }
    load();
  }

  const upcoming = trips.filter(t => isUpcoming(t.date)).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = trips.filter(t => !isUpcoming(t.date)).sort((a, b) => new Date(b.date) - new Date(a.date));

  const years = useMemo(() => {
    const set = new Set(trips.filter(t => t.date).map(t => new Date(t.date).getFullYear()));
    set.add(new Date().getFullYear());
    return Array.from(set).sort((a, b) => b - a);
  }, [trips]);

  const calendarTrips = useMemo(() => {
    return trips
      .filter(t => t.date && new Date(t.date).getFullYear() === calendarYear)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [trips, calendarYear]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <>
      <Navbar />
      <div className="main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Your Adventures</h1>
            <p className="page-subtitle">
              {trips.length} trip{trips.length !== 1 ? 's' : ''} planned
              {isAdmin ? ' · showing all users' : ''}
            </p>
          </div>
          <div className="page-header-actions">
            <div className="button-group">
              <button
                className={viewMode === 'list' ? 'btn btn-primary' : 'btn btn-outline'}
                type="button"
                onClick={() => setViewMode('list')}
              >
                List view
              </button>
              <button
                className={viewMode === 'calendar' ? 'btn btn-primary' : 'btn btn-outline'}
                type="button"
                onClick={() => setViewMode('calendar')}
              >
                Year calendar
              </button>
            </div>
            <button className="btn btn-primary" onClick={() => setModal('add')}>＋ Add Trip</button>
          </div>
        </div>
        {viewMode === 'calendar' && (
          <div className="calendar-bar">
            <label>
              Year:
              <select value={calendarYear} onChange={e => setCalendarYear(Number(e.target.value))}>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
            <div className="calendar-summary">
              {calendarTrips.length} trip{calendarTrips.length !== 1 ? 's' : ''} in {calendarYear}
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading trips…</div>
        ) : trips.length === 0 ? (
          <div className="empty-state">
            <span className="big-icon">🏕️</span>
            <h3>No trips yet</h3>
            <p>Start planning your first day out!</p>
            <br />
            <button className="btn btn-primary" onClick={() => setModal('add')}>＋ Add your first trip</button>
          </div>
        ) : (
          <>
            {viewMode === 'calendar' ? (
              <div className="calendar-grid">
                {monthNames.map((month, index) => {
                  const monthTrips = calendarTrips.filter(t => new Date(t.date).getMonth() === index);
                  return (
                    <div key={month} className="calendar-month-card">
                      <div className="calendar-month-title">{month}</div>
                      {monthTrips.length === 0 ? (
                        <div className="calendar-empty">No trips</div>
                      ) : (
                        monthTrips.map(trip => (
                          <button
                            key={trip.id}
                            type="button"
                            className="calendar-event"
                            onClick={() => setModal(trip)}
                          >
                            <span className="calendar-event-date">{new Date(trip.date).getDate()}</span>
                            <span>{trip.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                {upcoming.length > 0 && (
                  <>
                    <p className="section-label">Upcoming ({upcoming.length})</p>
                    <div className="trips-grid">
                      {upcoming.map(t => (
                        <TripCard key={t.id} trip={t} onEdit={setModal} onDeleted={load} />
                      ))}
                    </div>
                  </>
                )}
                {past.length > 0 && (
                  <>
                    <p className="section-label" style={{ color: 'var(--muted)' }}>Past trips ({past.length})</p>
                    <div className="trips-grid">
                      {past.map(t => (
                        <TripCard key={t.id} trip={t} onEdit={setModal} onDeleted={load} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      {modal && (
        <TripModal
          trip={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
