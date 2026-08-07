import { Filter, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MatchCard } from '../components/MatchCard';
import { Button, EmptyState, Skeleton } from '../components/ui';
import { useMatches } from '../hooks/useMatches';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../types';

export function MatchesPage() {
  const [query, setQuery] = useState(''); const [status, setStatus] = useState('all'); const { data: matches = [], isLoading } = useMatches(); const { appUser } = useAuth();
  const filtered = matches.filter((match) => (status === 'all' || match.status === status) && `${match.home_team?.name} ${match.away_team?.name} ${match.competition}`.toLowerCase().includes(query.toLowerCase()));
  return <><div className="page-heading"><div><p className="eyebrow">COMPETENCIA</p><h1>Partidos</h1><p>Agenda, asignaciones y actas de la Federación.</p></div>{appUser?.role === ROLES.ADMIN && <Link to="/partidos/nuevo"><Button><Plus size={17} /> Nuevo partido</Button></Link>}</div>
    <div className="toolbar"><label className="search-box"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar equipo o competencia…" /></label><label className="select-box"><Filter size={16} /><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Todos los estados</option><option value="scheduled">Programados</option><option value="in_progress">En juego</option><option value="finished">Finalizados</option><option value="cancelled">Cancelados</option></select></label></div>
    {isLoading ? <div className="match-grid">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="card-skeleton" />)}</div> : filtered.length ? <div className="match-grid">{filtered.map((match) => <MatchCard key={match.id} match={match} />)}</div> : <EmptyState title="No encontramos partidos" detail="Ajusta la búsqueda o crea un nuevo partido." />}
  </>;
}
