import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from '../lib/supabase';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (!form.username.trim()) {
        setError('Username is required');
        setLoading(false);
        return;
      }
      if (!form.password.trim()) {
        setError('Password is required');
        setLoading(false);
        return;
      }

      if (mode === 'login') {
        await signIn(form.username, form.password);
      } else {
        if (!form.name.trim()) {
          setError('Full name is required');
          setLoading(false);
          return;
        }
        await signUp(form.username, form.password, form.name);
      }
      navigate('/trips');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="icon">🗺️</span>
          <h1>Days Out Planner</h1>
          <p>Plan your UK adventures</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Full name</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" required />
            </div>
          )}
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={form.username} onChange={e => set('username', e.target.value)} placeholder="yourusername" required />
            <small className="form-help">You can sign in with this username instead of email.</small>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Please wait…' : (mode === 'login' ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button onClick={() => { setMode('register'); setError(''); }}>Register</button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(''); }}>Sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
