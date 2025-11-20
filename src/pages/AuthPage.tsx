import { useState } from 'react';
import Loader from '../components/Loader';

const AuthPage = ({ onAuthSuccess }: { onAuthSuccess: (user: any) => void }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
    remember: true
  });

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'register') {
        if (!form.username || !form.email || form.password.length < 8 || form.password !== form.confirm) {
          throw new Error('Please provide valid credentials (password >= 8 and matches confirmation).');
        }
        const user = await window.electronAPI.register({ username: form.username, email: form.email, password: form.password });
        onAuthSuccess(user);
      } else {
        const identifier = form.email || form.username;
        if (!identifier) throw new Error('Email or username required');
        const user = await window.electronAPI.login({ identifier, password: form.password, remember: form.remember });
        onAuthSuccess(user);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Vortex Security Portal</h1>
        <p className="subtitle">Educational antivirus – local only</p>
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          )}
          <input
            placeholder="Email or Username"
            value={mode === 'login' ? form.email || form.username : form.email}
            onChange={(e) => (mode === 'login' ? setForm({ ...form, email: e.target.value, username: e.target.value }) : setForm({ ...form, email: e.target.value }))}
            required
          />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {mode === 'register' && (
            <input type="password" placeholder="Confirm Password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          )}
          {mode === 'login' && (
            <label className="remember">
              <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} /> Remember me
            </label>
          )}
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? <Loader label={mode === 'login' ? 'Authenticating' : 'Creating user'} /> : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
        <button className="link" onClick={toggleMode}>
          {mode === 'login' ? 'Create account' : 'Back to login'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
