import {SettingsStorage} from '@/utils/settingsStorage';

/**
 * Format a Date (or date-like input) according to a simple format token.
 * Supported formats:
 *  - 'YYYY-MM-DD' (default)
 *  - 'MM/DD/YYYY'
 *  - 'DD/MM/YYYY'
 *  - 'MMM DD, YYYY' (e.g. Aug 30, 2025)
 */
export function formatDate(
    dateInput: Date | string | number,
    format: string = 'YYYY-MM-DD'
): string {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '';

    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1; // 1-12
    const dd = date.getDate();

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const shortMonths = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    switch (format) {
        case 'MM/DD/YYYY':
            return `${pad(mm)}/${pad(dd)}/${yyyy}`;
        case 'DD/MM/YYYY':
            return `${pad(dd)}/${pad(mm)}/${yyyy}`;
        case 'MMM DD, YYYY':
            return `${shortMonths[mm - 1]} ${pad(dd)}, ${yyyy}`;
        case 'YYYY-MM-DD':
        default:
            return `${yyyy}-${pad(mm)}-${pad(dd)}`;
    }
}

// load the user's settings and format the given date according to the saved 'dateFormat' setting.

export async function formatDateFromSettings(dateInput: Date | string | number): Promise<string> {
    try {
        const settings = await SettingsStorage.getSettings();
        return formatDate(dateInput, settings.dateFormat || 'YYYY-MM-DD');
    } catch {
        // On error, fall back to a sane default
        return formatDate(dateInput, 'YYYY-MM-DD');
    }
}
