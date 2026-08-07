import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Shield, UserCheck, Users } from 'lucide-react';
import { Button, EmptyState, Skeleton, StatusBadge } from '../components/ui';
import { userRepository } from '../repositories/userRepository';
import { getErrorMessage, initials } from '../utils/formatters';

export function UsersPage() {
  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: userRepository.list }); const client = useQueryClient(); const update = useMutation({ mutationFn: ({ id, payload }) => userRepository.update(id, payload), onSuccess: () => client.invalidateQueries({ queryKey: ['users'] }) }); const change = async (id, payload) => { try { await update.mutateAsync({ id, payload }); } catch (error) { window.alert(getErrorMessage(error)); } };
  return <><div className="page-heading"><div><p className="eyebrow">CONTROL DE ACCESO</p><h1>Usuarios</h1><p>Asigna permisos y habilita las cuentas registradas.</p></div><div className="users-summary"><Users size={18} /> {users.length} cuentas</div></div>
    <section className="content-card table-card">{isLoading ? <Skeleton className="page-skeleton" /> : users.length ? <div className="responsive-table"><table><thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Acceso</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><div className="user-cell"><span className="avatar">{initials(user.profile?.full_name || user.email)}</span><span><strong>{user.profile?.full_name || 'Sin nombre'}</strong><small>{user.email}</small></span></div></td><td><label className="table-select"><Shield size={15} /><select value={user.role} onChange={(e) => change(user.id, { role: e.target.value })}><option value="referee">Árbitro</option><option value="admin">Administrador</option></select></label></td><td><StatusBadge status={user.status} /></td><td><Button variant={user.status === 'active' ? 'ghost' : 'primary'} className="small-button" onClick={() => change(user.id, { status: user.status === 'active' ? 'inactive' : 'active' })}><UserCheck size={15} /> {user.status === 'active' ? 'Suspender' : 'Habilitar'}</Button></td></tr>)}</tbody></table></div> : <EmptyState title="No hay usuarios" detail="Las cuentas aparecerán al completar el registro." />}</section>
  </>;
}
