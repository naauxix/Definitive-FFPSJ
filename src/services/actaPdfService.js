import { formatDate, formatDateTime } from '../utils/formatters';
import { eventLabels } from '../types';

export async function downloadActaPdf(match) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const blue = [23, 105, 224];
  doc.setFillColor(...blue); doc.rect(0, 0, 210, 32, 'F');
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text('FFPSJ · ACTA OFICIAL DE PARTIDO', 16, 15);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text(`Generada el ${formatDate(new Date())}`, 16, 23);
  doc.setTextColor(20, 30, 50); doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text(match.competition || 'Partido oficial', 16, 46);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.text(`${formatDateTime(match.scheduled_at)} · ${match.venue || 'Sede pendiente'}`, 16, 53);
  doc.setDrawColor(225, 230, 238); doc.line(16, 59, 194, 59);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text(match.home_team?.name || 'Local', 16, 74);
  doc.text(match.away_team?.name || 'Visitante', 194, 74, { align: 'right' });
  doc.setFillColor(245, 248, 252); doc.roundedRect(78, 63, 54, 20, 3, 3, 'F');
  doc.setFontSize(23); doc.text(`${match.home_score} — ${match.away_score}`, 105, 77, { align: 'center' });
  doc.setFontSize(11); doc.text('Árbitro responsable', 16, 97); doc.setFont('helvetica', 'normal'); doc.text(match.referee?.full_name || 'Sin asignar', 16, 104);
  doc.setFont('helvetica', 'bold'); doc.text('Alineaciones', 16, 119);
  const side = (teamId) => (match.match_players || []).filter((line) => line.team_id === teamId).sort((a, b) => a.shirt_number - b.shirt_number);
  const writeRoster = (team, left) => {
    let y = 128;
    doc.setFont('helvetica', 'bold'); doc.text(team?.short_name || team?.name || 'Equipo', left, y); y += 6;
    doc.setFont('helvetica', 'normal');
    side(team?.id).forEach((line) => { doc.text(`${line.shirt_number}. ${line.player?.full_name || 'Jugador'}${line.starter ? ' (T)' : ''}`, left, y); y += 5; });
    if (y === 134) doc.text('Sin alineación registrada', left, y);
  };
  writeRoster(match.home_team, 16); writeRoster(match.away_team, 108);
  let y = 175; doc.setFont('helvetica', 'bold'); doc.text('Cronología de eventos', 16, y); y += 8;
  doc.setFont('helvetica', 'normal');
  (match.events || []).sort((a, b) => a.minute - b.minute).forEach((event) => {
    if (y > 278) { doc.addPage(); y = 20; }
    doc.text(`${event.minute}'  ${eventLabels[event.event_type]}${event.player ? ` · ${event.player.full_name}` : ''}${event.description ? ` — ${event.description}` : ''}`, 16, y); y += 6;
  });
  if (match.observations) { y += 5; doc.setFont('helvetica', 'bold'); doc.text('Observaciones', 16, y); y += 6; doc.setFont('helvetica', 'normal'); doc.text(doc.splitTextToSize(match.observations, 178), 16, y); }
  doc.setTextColor(120, 130, 145); doc.setFontSize(8); doc.text('Federación de Fútbol Playa de San Juan · Documento oficial', 105, 288, { align: 'center' });
  doc.save(`Acta-${match.home_team?.short_name || 'LOCAL'}-${match.away_team?.short_name || 'VISITANTE'}.pdf`);
}
