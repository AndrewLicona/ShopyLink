export type DayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
export type DayHours = { open: string; close: string } | null;
export type BusinessHours = Partial<Record<DayKey, DayHours>>;

/**
 * Returns true if the store is currently open based on its businessHours config.
 * Defaults to true (always open) when no hours are configured.
 */
export function isStoreOpen(hours: BusinessHours | null | undefined): boolean {
  if (!hours) return true; // No config = always open
  const days: readonly DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const now = new Date();
  const dayKey = days[now.getDay()];
  if (!dayKey) return true;

  const todayHours = hours[dayKey];
  if (!todayHours) return false; // Explicitly closed this day

  const [oh = 0, om = 0] = todayHours.open.split(':').map(Number);
  const [ch = 0, cm = 0] = todayHours.close.split(':').map(Number);
  const currentMins = now.getHours() * 60 + now.getMinutes();
  return currentMins >= oh * 60 + om && currentMins < ch * 60 + cm;
}

/** Returns a friendly label for a day key */
export function getDayLabel(key: DayKey): string {
  const labels: Record<DayKey, string> = {
    sun: 'Domingo', mon: 'Lunes', tue: 'Martes', wed: 'Miércoles',
    thu: 'Jueves', fri: 'Viernes', sat: 'Sábado',
  };
  return labels[key];
}
