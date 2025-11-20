import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ScanPage from './pages/ScanPage';
import QuarantinePage from './pages/QuarantinePage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';
import Loader from './components/Loader';
import type { User } from './types/models';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    const current = await window.electronAPI.getSession();
    setUser(current);
    setLoading(false);
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleLogout = async () => {
    await window.electronAPI.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <Loader label="Initializing Vortex" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={(u) => setUser(u)} />;
  }

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/scan" element={<ScanPage user={user} />} />
          <Route path="/quarantine" element={<QuarantinePage user={user} />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
