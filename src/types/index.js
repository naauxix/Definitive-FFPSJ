export const ROLES = Object.freeze({ ADMIN: 'admin', REFEREE: 'referee' });
export const MATCH_STATUS = Object.freeze({ SCHEDULED: 'scheduled', IN_PROGRESS: 'in_progress', FINISHED: 'finished', CANCELLED: 'cancelled' });
export const EVENT_TYPES = Object.freeze({ GOAL: 'goal', YELLOW_CARD: 'yellow_card', RED_CARD: 'red_card', SUBSTITUTION: 'substitution', NOTE: 'note' });

export const eventLabels = {
  goal: 'Gol', yellow_card: 'Tarjeta amarilla', red_card: 'Tarjeta roja', substitution: 'Sustitución', note: 'Observación',
};

export const matchStatusLabels = {
  scheduled: 'Programado', in_progress: 'En juego', finished: 'Finalizado', cancelled: 'Cancelado',
};
