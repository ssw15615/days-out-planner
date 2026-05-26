import { useEffect, useState } from 'react';
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
          <button className="btn btn-primary" onClick={() => setModal('add')}>＋ Add Trip</button>
        </div>

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
