import { format, formatDistanceToNow, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(date: Date | string | number) {
  if (!date) return '';
  return format(new Date(date), 'dd/MM/yyyy', { locale: es });
}

export function formatRelativeTime(date: Date | string | number) {
  if (!date) return '';
  const d = new Date(date);
  if (isPast(d)) {
    return `Venció hace ${formatDistanceToNow(d, { locale: es })}`;
  }
  return `Vence en ${formatDistanceToNow(d, { locale: es })}`;
}
