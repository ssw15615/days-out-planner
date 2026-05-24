import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getAllProfiles, getTrips, adminCreateUser, deleteUser, updateProfile } from '../lib/supabase';
import { toast } from '../lib/toast';
import { isUpcoming, initials } from '../lib/utils';
import Navbar from '../components/Navbar';

export default function AdminPage() {
  const { session, isAdmin } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', username: '', password: '', role: 'user' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    loadAll();
  }, [isAdmin]);

  async function loadAll() {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([getAllProfiles(), getTrips(session.user.id, true)]);
      setProfiles(p);
      setTrips(t);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    if (!createForm.name || !createForm.username || !createForm.password) {
      toast('Fill all fields', 'error'); return;
    }
    setCreating(true);
    try {
      await adminCreateUser(createForm.username, createForm.password, createForm.name, createForm.role);
      toast(`Account created for ${createForm.name}`, 'success');
      setShowCreate(false);
      setCreateForm({ name: '', username: '', password: '', role: 'user' });
      loadAll();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteUser(userId, name) {
    if (userId === session.user.id) { toast("Can't delete your own account", 'error'); return; }
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await deleteUser(userId);
      toast('User deleted');
      loadAll();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await updateProfile(userId, { role: newRole });
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
            <p className="page-subtitle">Manage users and view platform stats</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(s => !s)}>
            {showCreate ? '✕ Cancel' : '＋ Create user'}
          </button>
        </div>

        {showCreate && (
          <div className="card" style={{ marginBottom: '1.5rem', maxWidth: '480px' }}>
            <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '15px' }}>New user account</p>
            <form onSubmit={handleCreateUser}>
              <div className="row-2">
                <div className="form-group">
                  <label>Full name</label>
                  <input type="text" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={createForm.username} onChange={e => setCreateForm(f => ({ ...f, username: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Temporary password</label>
                <input type="text" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating…' : 'Create account'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

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
                      <th>Username</th>
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
                            {p.id === session.user.id && <span className="badge badge-teal" style={{ fontSize: '10px' }}>You</span>}
                          </div>
                        </td>
                        <td style={{ color: 'var(--muted)' }}>{p.username || '—'}</td>
                        <td>
                          <select
                            value={p.role || 'user'}
                            onChange={e => handleRoleChange(p.id, e.target.value)}
                            style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--cream)' }}
                            disabled={p.id === session.user.id}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>{trips.filter(t => t.user_id === p.id).length}</td>
                        <td style={{ color: 'var(--muted)' }}>
                          {p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : '—'}
                        </td>
                        <td>
                          {p.id !== session.user.id && (
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
