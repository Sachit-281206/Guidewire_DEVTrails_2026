import { useState } from 'react';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);

  const handleAuth = (u) => { setUser(u); setPage('dashboard'); };
  const handleLogout = () => { setUser(null); setPage('home'); };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-full max-w-[420px] min-h-screen shadow-2xl overflow-hidden relative" style={{ boxShadow: '0 0 60px rgba(59,130,246,0.15)' }}>
        {page === 'home'      && <Home onLogin={() => setPage('login')} onRegister={() => setPage('register')} />}
        {page === 'register'  && <Register onRegistered={handleAuth} onBack={() => setPage('home')} />}
        {page === 'login'     && <Login onLoggedIn={handleAuth} onBack={() => setPage('home')} />}
        {page === 'dashboard' && user && <Dashboard user={user} onLogout={handleLogout} />}
      </div>
    </div>
  );
}
