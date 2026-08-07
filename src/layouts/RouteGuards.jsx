import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../types';

export function ProtectedRoute() {
  const { session, appUser, loading } = useAuth();
  if (loading) return <div className="app-loader"><span className="loading-spinner" />Cargando sesión segura…</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (!appUser || appUser.status !== 'active') return <Navigate to="/acceso-restringido" replace />;
  return <Outlet />;
}

export function RoleRoute({ roles }) {
  const { appUser } = useAuth();
  return roles.includes(appUser?.role) ? <Outlet /> : <Navigate to="/" replace />;
}

export const AdminRoute = () => <RoleRoute roles={[ROLES.ADMIN]} />;
