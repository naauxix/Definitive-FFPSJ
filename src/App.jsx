import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AdminRoute, ProtectedRoute } from './layouts/RouteGuards';

const page = (loader, name) => lazy(() => loader().then((module) => ({ default: module[name] })));
const LoginPage = page(() => import('./pages/LoginPage'), 'LoginPage');
const AccessRestrictedPage = page(() => import('./pages/LoginPage'), 'AccessRestrictedPage');
const DashboardPage = page(() => import('./pages/DashboardPage'), 'DashboardPage');
const MatchesPage = page(() => import('./pages/MatchesPage'), 'MatchesPage');
const MatchFormPage = page(() => import('./pages/MatchFormPage'), 'MatchFormPage');
const MatchDetailPage = page(() => import('./pages/MatchDetailPage'), 'MatchDetailPage');
const TeamsPage = page(() => import('./pages/TeamsPage'), 'TeamsPage');
const UsersPage = page(() => import('./pages/UsersPage'), 'UsersPage');
const SettingsPage = page(() => import('./pages/SettingsPage'), 'SettingsPage');
const NotFoundPage = page(() => import('./pages/NotFoundPage'), 'NotFoundPage');

export default function App() {
  return <HashRouter><Suspense fallback={<div className="app-loader"><span className="loading-spinner" />Preparando FFPSJ…</div>}><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/acceso-restringido" element={<AccessRestrictedPage />} />
    <Route element={<ProtectedRoute />}><Route element={<AppLayout />}>
      <Route index element={<DashboardPage />} />
      <Route path="partidos" element={<MatchesPage />} />
      <Route path="partidos/:id" element={<MatchDetailPage />} />
      <Route element={<AdminRoute />}><Route path="partidos/nuevo" element={<MatchFormPage />} /><Route path="partidos/:id/editar" element={<MatchFormPage />} /><Route path="usuarios" element={<UsersPage />} /><Route path="configuracion" element={<SettingsPage />} /></Route>
      <Route path="equipos" element={<TeamsPage />} />
    </Route></Route>
    <Route path="/" element={<Navigate to="/" replace />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></Suspense></HashRouter>;
}
