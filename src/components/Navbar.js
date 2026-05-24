import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { signOut } from '../lib/supabase';
import { toast } from '../lib/toast';
import { initials } from '../lib/utils';

export default function Navbar() {
  const { profile, isAdmin } = useAuth();
  const location = useLocation();
  const active = (path) => location.pathname === path ? 'nav-tab active' : 'nav-tab';

  async function handleSignOut() {
    try { await signOut(); }
    catch { toast('Sign out failed', 'error'); }
  }

  return (
    <nav className="nav">
      <Link to="/trips" className="nav-brand">🗺️ Days Out</Link>

      <div className="nav-tabs">
        <Link to="/trips" className={active('/trips')}>My Trips</Link>
        <Link to="/map" className={active('/map')}>Map View</Link>
        <Link to="/explore" className={active('/explore')}>Explore</Link>
        {isAdmin && <Link to="/admin" className={active('/admin')}>Admin</Link>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="nav-avatar" title={profile?.name}>
          {initials(profile?.name || '')}
        </div>
        <span style={{ color: '#d1d5db', fontSize: '13px' }}>{profile?.name}</span>
        {isAdmin && (
          <span className="badge badge-gold" style={{ fontSize: '10px' }}>Admin</span>
        )}
        <button
          className="btn btn-sm btn-outline"
          style={{ color: '#9ca3af', borderColor: '#374151' }}
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
