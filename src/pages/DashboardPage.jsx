import { CalendarDays, ChevronRight, ClipboardCheck, Goal, Plus, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MatchCard } from '../components/MatchCard';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { useMatches } from '../hooks/useMatches';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../types';

export function DashboardPage() {
  const { data: matches = [], isLoading } = useMatches(); const { appUser } = useAuth();
  const scheduled = matches.filter((m) => m.status === 'scheduled').length; const live = matches.filter((m) => m.status === 'in_progress').length; const finished = matches.filter((m) => m.status === 'finished').length;
  return <><div className="page-heading"><div><p className="eyebrow">PANEL PRINCIPAL</p><h1>Resumen deportivo</h1><p>Supervisa la actividad y accede a tus próximos compromisos.</p></div>{appUser?.role === ROLES.ADMIN && <Link to="/partidos/nuevo"><Button><Plus size={17} /> Nuevo partido</Button></Link>}</div>
    <section className="stat-grid"><Stat icon={CalendarDays} label="Programados" value={scheduled} tone="blue" /><Stat icon={Goal} label="En juego" value={live} tone="amber" /><Stat icon={ClipboardCheck} label="Actas finalizadas" value={finished} tone="green" /><Stat icon={Trophy} label="Total de partidos" value={matches.length} tone="purple" /></section>
    <section className="section-heading"><div><h2>Próximos partidos</h2><p>Agenda habilitada para tu perfil.</p></div><Link to="/partidos" className="text-link">Ver todos <ChevronRight size={16} /></Link></section>
    {isLoading ? <div className="match-grid">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="card-skeleton" />)}</div> : matches.length ? <div className="match-grid">{matches.slice(0, 6).map((match) => <MatchCard key={match.id} match={match} />)}</div> : <EmptyState title="Todavía no hay partidos" detail="Cuando se creen partidos en Supabase aparecerán aquí." action={appUser?.role === ROLES.ADMIN && <Link to="/partidos/nuevo"><Button>Crear primer partido</Button></Link>} />}
  </>;
}
function Stat({ icon: Icon, label, value, tone }) { return <article className={`stat-card ${tone}`}><span><Icon size={19} /></span><div><small>{label}</small><strong>{value}</strong></div></article>; }
