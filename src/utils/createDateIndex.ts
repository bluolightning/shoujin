export interface DateIndex {
    [date: string]: {
        [url: string]: {
            dailyTime: number;
            hours: {[hour: string]: number};
            favicon: string | undefined;
        };
    };
}

// Create a date-based data index for faster filtering
export default function createDateIndex(allData: PageTimeEntry[]): DateIndex {
    const index: DateIndex = {};
    for (const entry of allData) {
        for (const date in entry.dateData) {
            if (!index[date]) {
                index[date] = {};
            }
            index[date][entry.url] = {
                ...entry.dateData[date],
                favicon: entry.favicon,
            };
        }
    }
    return index;
}
