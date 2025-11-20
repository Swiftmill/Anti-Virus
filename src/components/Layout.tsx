import { NavLink } from 'react-router-dom';
import type { User } from '../types/models';
import { useMemo } from 'react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '🌀' },
  { to: '/scan', label: 'Scan', icon: '🛡️' },
  { to: '/quarantine', label: 'Quarantine', icon: '⚠️' },
  { to: '/logs', label: 'Logs', icon: '📜' },
  { to: '/settings', label: 'Settings', icon: '⚙️' }
];

const Layout = ({ children, user, onLogout }: { children: React.ReactNode; user: User; onLogout: () => void }) => {
  const status = useMemo(() => ({ text: 'Protected', color: '#6ef2ff' }), []);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">Vortex</div>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} end={item.to === '/'}>
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="user-card">
          <div>
            <p className="user-name">{user.username}</p>
            <p className="user-role">{user.role}</p>
          </div>
          <button className="outline" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="app-header">
          <div>
            <p className="welcome">Welcome back, {user.username}</p>
            <p className="status" style={{ color: status.color }}>
              {status.text}
            </p>
          </div>
        </header>
        <section className="content">{children}</section>
      </main>
    </div>
  );
};

export default Layout;
