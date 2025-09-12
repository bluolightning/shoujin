import type {PageTimeEntry} from './storage';

export type TimeByHourMap = {[hour: string]: number};

export default function getTimeByHour(data: PageTimeEntry[]): TimeByHourMap {
    const timeByHour: TimeByHourMap = {};

    // Initialize all hours (0-23) with 0 time
    for (let hour = 0; hour < 24; hour++) {
        const hourKey = `h${hour}`;
        timeByHour[hourKey] = 0;
    }

    // Aggregate time spent for each hour across all entries and dates
    data.forEach((entry) => {
        Object.values(entry.dateData).forEach((dateInfo) => {
            Object.entries(dateInfo.hours).forEach(([hourKey, hourData]) => {
                timeByHour[hourKey] = (timeByHour[hourKey] || 0) + Math.round(hourData.time);
            });
        });
    });

    return timeByHour;
}
