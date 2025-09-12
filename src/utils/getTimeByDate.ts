import type {PageTimeEntry} from './storage';

export type TimeByDateMap = {[key: string]: number};

export default function getTimeByDate(data: PageTimeEntry[]): TimeByDateMap {
    const timeByDate = data.reduce((acc, site) => {
        for (const [date, {dailyTime}] of Object.entries(site.dateData)) {
            const roundedTime = Math.round(dailyTime);
            acc[date] = (acc[date] || 0) + roundedTime;
        }
        return acc;
    }, {} as TimeByDateMap);

    const sortedEntries = Object.entries(timeByDate).sort(([a], [b]) => a.localeCompare(b));
    const sortedTimeByDate: TimeByDateMap = Object.fromEntries(sortedEntries);

    return sortedTimeByDate;
}
