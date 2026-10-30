import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/reports', label: 'Reports' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          QA Management
          <small>Internal Console</small>
        </div>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            {l.label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink to="/settings" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Settings
          </NavLink>
        )}
        <a href="/public" target="_blank" rel="noreferrer" className="nav-link">
          Public dashboard ↗
        </a>
        <div className="nav-spacer" />
        <div className="nav-footer">
          <div className="nav-user">
            <b>{user?.name}</b>
            {user?.email} · {user?.role}
          </div>
          <button className="btn small" style={{ width: '100%' }} onClick={handleLogout}>Log out</button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
