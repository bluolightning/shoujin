import {PageTimeEntry} from './storage';

export default function filterDataByDate(
    allData: PageTimeEntry[],
    start: string,
    end: string
): PageTimeEntry[] {
    if (start > end) {
        console.warn('Start date is after end date. Reversing...');
        [start, end] = [end, start];
    }

    const filtered = allData
        .map((entry) => {
            const newDateData: PageTimeEntry['dateData'] = {};
            let newTimeSpent = 0;

            for (const [date, info] of Object.entries(entry.dateData || {})) {
                if (date >= start && date <= end) {
                    newDateData[date] = {
                        dailyTime: info.dailyTime,
                        hours: {...info.hours},
                    };
                    newTimeSpent += info.dailyTime;
                }
            }

            if (Object.keys(newDateData).length === 0) return null;

            return {
                ...entry,
                dateData: newDateData,
                timeSpent: newTimeSpent,
            } as PageTimeEntry;
        })
        .filter((e): e is PageTimeEntry => e !== null)
        .sort((a, b) => b.timeSpent - a.timeSpent);

    return filtered;
}
