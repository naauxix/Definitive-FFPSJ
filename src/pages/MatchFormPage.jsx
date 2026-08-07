import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Button, Field, Skeleton } from '../components/ui';
import { useMatch, useSaveMatch } from '../hooks/useMatches';
import { useTeams } from '../hooks/useTeams';
import { userRepository } from '../repositories/userRepository';
import { getErrorMessage } from '../utils/formatters';

const schema = z.object({
  competition: z.string().min(2, 'Ingresa una competencia.'), round: z.string().optional(), scheduled_at: z.string().min(1, 'Selecciona fecha y hora.'), venue: z.string().min(2, 'Indica la sede.'),
  home_team_id: z.string().uuid('Selecciona el equipo local.'), away_team_id: z.string().uuid('Selecciona el equipo visitante.'), assigned_referee_id: z.string().optional(), status: z.enum(['scheduled', 'in_progress', 'finished', 'cancelled']),
}).refine((data) => data.home_team_id !== data.away_team_id, { message: 'Local y visitante deben ser equipos distintos.', path: ['away_team_id'] });

const emptyValues = { competition: '', round: '', scheduled_at: '', venue: '', home_team_id: '', away_team_id: '', assigned_referee_id: '', status: 'scheduled' };

export function MatchFormPage() {
  const { id } = useParams(); const isEditing = Boolean(id); const navigate = useNavigate();
  const { data: match, isLoading: matchLoading } = useMatch(id); const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: userRepository.list }); const save = useSaveMatch();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: emptyValues });
  useEffect(() => { if (match) reset({ competition: match.competition || '', round: match.round || '', scheduled_at: match.scheduled_at ? format(new Date(match.scheduled_at), "yyyy-MM-dd'T'HH:mm") : '', venue: match.venue || '', home_team_id: match.home_team?.id || '', away_team_id: match.away_team?.id || '', assigned_referee_id: match.referee?.id || '', status: match.status }); }, [match, reset]);
  const onSubmit = async (values) => {
    try { const saved = await save.mutateAsync({ id, payload: { ...values, assigned_referee_id: values.assigned_referee_id || null, scheduled_at: new Date(values.scheduled_at).toISOString() } }); navigate(`/partidos/${id || saved.id}`); }
    catch (error) { window.alert(getErrorMessage(error)); }
  };
  if (isEditing && matchLoading) return <Skeleton className="page-skeleton" />;
  return <><div className="page-heading compact"><div><Link className="back-link" to={isEditing ? `/partidos/${id}` : '/partidos'}><ArrowLeft size={16} /> Volver</Link><h1>{isEditing ? 'Editar partido' : 'Nuevo partido'}</h1><p>Define la programación y la asignación arbitral.</p></div></div>
    <form className="content-card form-card" onSubmit={handleSubmit(onSubmit)}><section><h2>Información del encuentro</h2><div className="form-grid"><Field label="Competencia" error={errors.competition?.message}><input placeholder="Ej. Liga Provincial 2026" {...register('competition')} /></Field><Field label="Jornada / fecha"><input placeholder="Ej. Fecha 3" {...register('round')} /></Field><Field label="Fecha y hora" error={errors.scheduled_at?.message}><input type="datetime-local" {...register('scheduled_at')} /></Field><Field label="Sede" error={errors.venue?.message}><input placeholder="Ej. Complejo Deportivo…" {...register('venue')} /></Field></div></section>
      <section><h2>Participantes</h2>{teamsLoading ? <Skeleton className="line-skeleton" /> : <div className="form-grid"><Field label="Equipo local" error={errors.home_team_id?.message}><select {...register('home_team_id')}><option value="">Seleccionar equipo</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></Field><Field label="Equipo visitante" error={errors.away_team_id?.message}><select {...register('away_team_id')}><option value="">Seleccionar equipo</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></Field></div>}</section>
      <section><h2>Acta y responsable</h2><div className="form-grid"><Field label="Árbitro asignado"><select {...register('assigned_referee_id')}><option value="">Sin asignar</option>{users.filter((user) => user.role === 'referee' && user.status === 'active').map((user) => <option key={user.id} value={user.id}>{user.profile?.full_name || user.email}</option>)}</select></Field><Field label="Estado"><select {...register('status')}><option value="scheduled">Programado</option><option value="in_progress">En juego</option><option value="finished">Finalizado</option><option value="cancelled">Cancelado</option></select></Field></div></section>
      <footer className="form-actions"><Link to={isEditing ? `/partidos/${id}` : '/partidos'}><Button variant="ghost">Cancelar</Button></Link><Button type="submit" disabled={save.isPending}><Save size={17} /> {save.isPending ? 'Guardando…' : 'Guardar partido'}</Button></footer>
    </form></>;
}
