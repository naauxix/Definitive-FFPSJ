import { CalendarDays, MapPin, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../utils/formatters';
import { StatusBadge } from './ui';

export function MatchCard({ match }) {
  return <motion.div initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.18 }}><Link to={`/partidos/${match.id}`} className="match-card">
    <div className="match-card-top"><StatusBadge status={match.status} /><time><CalendarDays size={14} /> {formatDateTime(match.scheduled_at)}</time></div>
    <div className="scoreline"><strong>{match.home_team?.short_name || match.home_team?.name}</strong><b>{match.home_score} <i>—</i> {match.away_score}</b><strong>{match.away_team?.short_name || match.away_team?.name}</strong></div>
    <footer><span><MapPin size={14} /> {match.venue || 'Sede pendiente'}</span>{match.referee && <span><UserRound size={14} /> {match.referee.full_name}</span>}</footer>
  </Link></motion.div>;
}
