import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDateTime = (date) => date ? format(new Date(date), "EEE d 'de' MMM · HH:mm", { locale: es }) : 'Sin definir';
export const formatDate = (date) => date ? format(new Date(date), "d 'de' MMMM, yyyy", { locale: es }) : 'Sin definir';
export const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U';
export const getErrorMessage = (error) => error?.message || 'Ha ocurrido un error inesperado.';
