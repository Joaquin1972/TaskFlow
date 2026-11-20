/**
 * Utilidades de fecha y formato relativo seguras para la zona horaria local (YYYY-MM-DD)
 */

export function toLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return toLocalDateKey(dt);
}

export function parseLocalDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isOverdue(dateKey: string | null, completed: boolean, todayKey: string): boolean {
  if (!dateKey || completed) return false;
  return dateKey < todayKey;
}

export function formatDueDateLabel(dateKey: string | null, todayKey: string): string {
  if (!dateKey) return 'Sin fecha';
  if (dateKey === todayKey) return 'Hoy';
  const tomorrowKey = addDays(todayKey, 1);
  if (dateKey === tomorrowKey) return 'Mañana';
  const yesterdayKey = addDays(todayKey, -1);
  if (dateKey === yesterdayKey) return 'Ayer';

  const dt = parseLocalDate(dateKey);
  const todayDt = parseLocalDate(todayKey);
  const diffDays = Math.round((dt.getTime() - todayDt.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 1 && diffDays <= 6) {
    const raw = dt.toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
  const raw = dt.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function formatFullDateHeader(date: Date = new Date()): string {
  const raw = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function getShortDayLabel(dateKey: string): { weekday: string; dayNum: string } {
  const dt = parseLocalDate(dateKey);
  const rawWeekday = dt.toLocaleDateString('es-ES', { weekday: 'short' });
  return {
    weekday: rawWeekday.charAt(0).toUpperCase() + rawWeekday.slice(1),
    dayNum: String(dt.getDate()),
  };
}

export function getWeekKey(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return toLocalDateKey(d);
}
