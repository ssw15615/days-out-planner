import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getAllUsers, getAllTrips, updateUserRole, deleteUserAndTrips } from '../lib/firebaseDb';
import { toast } from '../lib/toast';
import { isUpcoming, initials } from '../lib/utils';
import Navbar from '../components/Navbar';

export default function AdminPage() {
  const { session, isAdmin } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    loadAll();
  }, [isAdmin]);

  async function loadAll() {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([getAllUsers(), getAllTrips()]);
      setProfiles(p);
      setTrips(t);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(userId, name) {
    if (userId === session.user.uid) { toast("Can't delete your own account", 'error'); return; }
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await deleteUserAndTrips(userId);
      toast('User deleted');
      loadAll();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await updateUserRole(userId, newRole);
      toast('Role updated', 'success');
      loadAll();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  if (!isAdmin) return (
    <><Navbar /><div className="main"><div className="empty-state"><span className="big-icon">🔒</span><h3>Admin only</h3></div></div></>
  );

  const upcomingCount = trips.filter(t => isUpcoming(t.date)).length;

  return (
    <>
      <Navbar />
      <div className="main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Panel</h1>
            <p className="page-subtitle">View users, trips and platform stats</p>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" />Loading…</div>
        ) : (
          <>
            <div className="stat-grid">
              <div className="stat-card"><div className="stat-num">{profiles.length}</div><div className="stat-label">Total users</div></div>
              <div className="stat-card"><div className="stat-num">{trips.length}</div><div className="stat-label">Total trips</div></div>
              <div className="stat-card"><div className="stat-num">{upcomingCount}</div><div className="stat-label">Upcoming</div></div>
              <div className="stat-card"><div className="stat-num">{trips.length - upcomingCount}</div><div className="stat-label">Past trips</div></div>
            </div>

            <div className="data-table-wrap">
              <div className="data-table-head">User accounts ({profiles.length})</div>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Trips</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="nav-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                              {initials(p.name || '')}
                            </div>
                            <strong>{p.name || '—'}</strong>
                            {p.id === session.user.uid && <span className="badge badge-teal" style={{ fontSize: '10px' }}>You</span>}
                          </div>
                        </td>
                        <td style={{ color: 'var(--muted)' }}>{p.email || '—'}</td>
                        <td>
                          <select
                            value={p.role || 'user'}
                            onChange={e => handleRoleChange(p.id, e.target.value)}
                            style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--cream)' }}
                            disabled={p.id === session.user.uid}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>{trips.filter(t => t.userId === p.id).length}</td>
                        <td style={{ color: 'var(--muted)' }}>
                          {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString('en-GB') : p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB') : '—'}
                        </td>
                        <td>
                          {p.id !== session.user.uid && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteUser(p.id, p.name)}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
