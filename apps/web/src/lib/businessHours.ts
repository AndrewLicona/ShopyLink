export type DayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
export type DayHours = { open: string; close: string } | null;
export type BusinessHours = Partial<Record<DayKey, DayHours>>;

const DAY_KEYS: readonly DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** Minutes since midnight for an "HH:MM" string. */
function toMinutes(time: string): number {
    const [h = 0, m = 0] = time.split(':').map(Number);
    return h * 60 + m;
}

/**
 * Returns true if the store is currently open based on its businessHours config.
 *
 * Defaults to true (always open) when no hours are configured at all.
 * A day without an entry means the store is closed that day.
 * Schedules that cross midnight (e.g. 22:00 -> 02:00) are supported: the closing
 * time is then evaluated against the previous day's opening window.
 */
export function isStoreOpen(hours: BusinessHours | null | undefined): boolean {
    if (!hours) return true; // No config = always open

    const hasAnyDay = DAY_KEYS.some((key) => hours[key]);
    if (!hasAnyDay) return true; // Empty config = always open

    const now = new Date();
    const today = DAY_KEYS[now.getDay()];
    if (!today) return true;

    const currentMins = now.getHours() * 60 + now.getMinutes();

    const isWithin = (day: DayKey | undefined): boolean => {
        if (!day) return false;
        const window = hours[day];
        if (!window) return false;

        const open = toMinutes(window.open);
        const close = toMinutes(window.close);

        // Overnight schedule: it belongs to the window opened the previous day.
        if (close <= open) {
            if (currentMins >= open) return true;
            const previousIndex = (DAY_KEYS.indexOf(day) + 6) % 7;
            const previousWindow = hours[DAY_KEYS[previousIndex] ?? day];
            if (previousWindow) {
                const prevOpen = toMinutes(previousWindow.open);
                const prevClose = toMinutes(previousWindow.close);
                if (prevClose <= prevOpen && currentMins < prevClose) return true;
            }
            return false;
        }

        return currentMins >= open && currentMins < close;
    };

    if (isWithin(today)) return true;

    // Still inside an overnight window that started yesterday.
    const previousIndex = (DAY_KEYS.indexOf(today) + 6) % 7;
    const previousDay = DAY_KEYS[previousIndex];
    if (previousDay) {
        const previousWindow = hours[previousDay];
        if (previousWindow && toMinutes(previousWindow.close) <= toMinutes(previousWindow.open)) {
            if (currentMins < toMinutes(previousWindow.close)) return true;
        }
    }

    return false;
}

/** Returns a friendly label for a day key */
export function getDayLabel(key: DayKey): string {
    const labels: Record<DayKey, string> = {
        sun: 'Domingo', mon: 'Lunes', tue: 'Martes', wed: 'Miércoles',
        thu: 'Jueves', fri: 'Viernes', sat: 'Sábado',
    };
    return labels[key];
}
