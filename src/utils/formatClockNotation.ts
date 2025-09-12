import {SettingsStorage} from '@/utils/settingsStorage';

export function formatClockNotation(dateInput: Date | string | number, format: string): string {
    let date: Date;
    if (dateInput instanceof Date) {
        date = dateInput;
    } else if (typeof dateInput === 'number' || typeof dateInput === 'string') {
        date = new Date(dateInput);
    } else {
        return '';
    }

    if (Number.isNaN(date.getTime())) return '';

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    if (format === '24h') {
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    } else if (format === '12h') {
        const period = hours >= 12 ? 'PM' : 'AM';
        const h12 = hours % 12 === 0 ? 12 : hours % 12;
        return `${h12}:${pad(minutes)}:${pad(seconds)} ${period}`;
    }

    // Fallback to 24h if unknown format
    console.warn(`Unknown format "${format}", defaulting to 24h format.`);
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export async function getClockNotationFormat() {
    const settings = await SettingsStorage.getSettings();
    return settings.timeFormat || '24h';
}
