interface PageTimeEntry {
    url: string;
    timeSpent: number;
    lastVisited: string;
    favicon: string | undefined;
    dateData: {
        [date: string]: {
            dailyTime: number;
            hours: { [hour: string]: number };
        };
    };
}

export class StorageManager {
    private static readonly STORAGE_KEY = 'timeeo_page_times';

    static async savePageTime(
        url: string,
        timeSpent: number,
        favicon: string | undefined
    ): Promise<void> {
        try {
            const data = await this.getAllStoredData();
            const entry = data.find((item) => item.url === url);

            const endTime = new Date();
            const startTime = new Date(endTime.getTime() - timeSpent * 1000);

            const dateData = entry?.dateData || {};

            // Distribute time across the correct hours
            this.distributeTimeAcrossHours(startTime, endTime, dateData);

            if (entry) {
                entry.timeSpent += timeSpent;
                entry.lastVisited = endTime.toISOString();
                if (favicon) {
                    entry.favicon = favicon;
                }
                entry.dateData = dateData;
            } else {
                data.push({
                    url,
                    timeSpent,
                    lastVisited: endTime.toISOString(),
                    favicon,
                    dateData,
                });
            }

            data.sort((a, b) => b.timeSpent - a.timeSpent); // Sort by time spent (descending)

            await browser.storage.local.set({ [this.STORAGE_KEY]: data });
        } catch (error) {
            console.error('Error saving page time:', error);
        }
    }

    private static distributeTimeAcrossHours(
        startTime: Date,
        endTime: Date,
        dateData: {
            [date: string]: {
                dailyTime: number;
                hours: { [hour: string]: number };
            };
        }
    ): void {
        const currentTime = new Date(startTime);

        while (currentTime < endTime) {
            const currentHour = currentTime.getHours();
            const hourKey = 'h' + currentHour;
            const dateKey = this.getDateKey(currentTime);

            // Initialize date data if it doesn't exist
            if (!dateData[dateKey]) {
                dateData[dateKey] = { dailyTime: 0, hours: {} };
            }
            if (!dateData[dateKey].hours[hourKey]) {
                dateData[dateKey].hours[hourKey] = 0;
            }

            // Calculate the end of the current hour
            const nextHour = new Date(currentTime);
            nextHour.setHours(currentHour + 1, 0, 0, 0);

            // Determine how much time to allocate to this hour
            const timeInThisHour = Math.min(
                (nextHour.getTime() - currentTime.getTime()) / 1000,
                (endTime.getTime() - currentTime.getTime()) / 1000
            );

            // Add time to this hour and daily total
            dateData[dateKey].hours[hourKey] += timeInThisHour;
            dateData[dateKey].dailyTime += timeInThisHour;

            // Move to the next hour
            currentTime.setTime(
                Math.min(nextHour.getTime(), endTime.getTime())
            );
        }
    }

    // Helper function to format date as YYYY-MM-DD
    private static getDateKey(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    static async getAllStoredData(): Promise<PageTimeEntry[]> {
        try {
            const result = await browser.storage.local.get(this.STORAGE_KEY);
            return result[this.STORAGE_KEY] || [];
        } catch (error) {
            console.error('Error getting page times:', error);
            return [];
        }
    }

    static async clearAllData(): Promise<void> {
        try {
            await browser.storage.local.set({ [this.STORAGE_KEY]: [] });
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
}
