import {PageTimeEntry} from './storage';

export type TimeByDateMap = {[key: string]: number};

export default function getTimeByDate(data: PageTimeEntry[]): TimeByDateMap {
    return data.reduce((acc, site) => {
        for (const [date, {dailyTime}] of Object.entries(site.dateData)) {
            const roundedTime = Math.round(dailyTime);
            acc[date] = (acc[date] || 0) + roundedTime;
        }
        return acc;
    }, {} as TimeByDateMap);
}
