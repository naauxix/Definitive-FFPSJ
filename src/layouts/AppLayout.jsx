import { CalendarDays, ChevronDown, LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, Trophy, Users, X } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../types';
import { initials } from '../utils/formatters';
import { Logo } from '../components/ui';
import { NotificationBell } from '../components/NotificationBell';

const baseItems = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/partidos', label: 'Partidos', icon: CalendarDays },
  { to: '/equipos', label: 'Equipos', icon: Trophy },
];
const adminItems = [{ to: '/usuarios', label: 'Usuarios', icon: Users }, { to: '/configuracion', label: 'Sistema', icon: Settings }];

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { appUser, signOut } = useAuth();
  const allItems = [...baseItems, ...(appUser?.role === ROLES.ADMIN ? adminItems : [])];
  const fullName = appUser?.profile?.full_name || appUser?.email || 'Usuario';
  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
      <div className="sidebar-top"><Logo /><button className="mobile-close icon-button" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
      <nav>{allItems.map(({ to, label, icon: Icon, end }) => <NavLink key={to} end={end} to={to} onClick={() => setMenuOpen(false)}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-footer"><div className="help-card"><ShieldCheck size={18} /><p>Sesión protegida con Supabase</p></div></div>
    </aside>
    {menuOpen && <button className="sidebar-shade" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />}
    <main className="app-main"><header className="topbar"><button className="mobile-menu icon-button" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div className="topbar-spacer" /><NotificationBell /><div className="user-menu"><span className="avatar">{initials(fullName)}</span><span className="user-name">{fullName}<small>{appUser?.role === ROLES.ADMIN ? 'Administrador' : 'Árbitro'}</small></span><ChevronDown size={15} /><button title="Cerrar sesión" className="signout" onClick={signOut}><LogOut size={16} /></button></div></header><div className="page-content"><Outlet /></div></main>
  </div>;
}
