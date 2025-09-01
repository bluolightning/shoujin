import {formatDate} from './formatDate';

export interface PageTimeEntry {
    url: string;
    timeSpent: number;
    lastVisited: string;
    favicon: string | undefined;
    dateData: {
        [date: string]: {
            dailyTime: number;
            hours: {[hour: string]: number};
        };
    };
    visitCount: number;
}

export class ImportError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ImportError';
    }
}

export class BackupRestoreError extends ImportError {
    constructor(message: string) {
        super(message);
        this.name = 'BackupRestoreError';
    }
}

export class StorageManager {
    private static readonly STORAGE_KEY = 'shoujin_page_data';
    private static readonly BACKUP_KEY = 'shoujin_page_data_backup';

    static async savePageTime(
        url: string,
        timeSpent: number,
        favicon: string | undefined,
        countAsVisit: boolean
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
                entry.visitCount = entry.visitCount + (countAsVisit ? 1 : 0) || 1;
            } else {
                data.push({
                    url,
                    timeSpent,
                    lastVisited: endTime.toISOString(),
                    favicon,
                    dateData,
                    visitCount: 1,
                });
            }

            data.sort((a, b) => b.timeSpent - a.timeSpent); // Sort by time spent (descending)

            await browser.storage.local.set({[this.STORAGE_KEY]: data});
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
                hours: {[hour: string]: number};
            };
        }
    ): void {
        const currentTime = new Date(startTime);

        while (currentTime < endTime) {
            const currentHour = currentTime.getHours();
            const hourKey = 'h' + currentHour;
            const dateKey = formatDate(currentTime);

            // Initialize date data if it doesn't exist
            if (!dateData[dateKey]) {
                dateData[dateKey] = {dailyTime: 0, hours: {}};
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
            currentTime.setTime(Math.min(nextHour.getTime(), endTime.getTime()));
        }
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
            await browser.storage.local.set({[this.STORAGE_KEY]: []});
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }

    static async importData(data: PageTimeEntry[]): Promise<void> {
        console.log('Starting import process...');
        const originalData = await this.getAllStoredData();

        try {
            await browser.storage.local.set({[this.BACKUP_KEY]: originalData});
            const mergedDataMap: {[url: string]: PageTimeEntry} = {};

            // Add existing data to the map
            for (const entry of originalData) {
                mergedDataMap[entry.url] = entry;
            }

            // Merge imported data
            for (const entry of data) {
                // Validate entry structure
                if (!entry.url || typeof entry.timeSpent !== 'number') {
                    console.warn('Skipping invalid entry during import:', entry);
                    continue;
                }

                if (mergedDataMap[entry.url]) {
                    const existingEntry = mergedDataMap[entry.url];
                    existingEntry.timeSpent += entry.timeSpent;
                    existingEntry.visitCount += entry.visitCount || 0;
                    existingEntry.lastVisited =
                        new Date(existingEntry.lastVisited) > new Date(entry.lastVisited)
                            ? existingEntry.lastVisited
                            : entry.lastVisited;
                    existingEntry.favicon = entry.favicon || existingEntry.favicon;

                    // Merge dateData
                    for (const [date, dateInfo] of Object.entries(entry.dateData)) {
                        if (!existingEntry.dateData[date]) {
                            existingEntry.dateData[date] = dateInfo;
                        } else {
                            existingEntry.dateData[date].dailyTime += dateInfo.dailyTime;
                            for (const [hour, time] of Object.entries(dateInfo.hours)) {
                                if (!existingEntry.dateData[date].hours[hour]) {
                                    existingEntry.dateData[date].hours[hour] = time;
                                } else {
                                    existingEntry.dateData[date].hours[hour] += time;
                                }
                            }
                        }
                    }
                } else {
                    mergedDataMap[entry.url] = entry;
                }
            }

            // Convert map back to array and sort
            const mergedData = Object.values(mergedDataMap);
            mergedData.sort((a, b) => b.timeSpent - a.timeSpent);

            await browser.storage.local.set({[this.STORAGE_KEY]: mergedData});
            await browser.storage.local.remove(this.BACKUP_KEY);
            console.log('Import process completed successfully.');
        } catch (error) {
            console.error('Error during import process. Attempting to restore backup...', error);
            let restoreSuccessful = false;

            try {
                const backupResult = await browser.storage.local.get(this.BACKUP_KEY);
                const backupData = backupResult[this.BACKUP_KEY];
                if (backupData) {
                    await browser.storage.local.set({[this.STORAGE_KEY]: backupData});
                    await browser.storage.local.remove(this.BACKUP_KEY);
                    restoreSuccessful = true;
                } else {
                    throw new BackupRestoreError(
                        'The import failed, and the backup data could not be found. Your data may be lost.'
                    );
                }
            } catch (restoreError) {
                console.error('CRITICAL: Failed to restore backup.', restoreError);
                throw new BackupRestoreError(
                    'The import failed, and a critical error occurred while trying to restore your original data. Your data may be corrupted or lost.'
                );
            }

            if (restoreSuccessful) {
                throw new ImportError(
                    'The import failed due to an error, but your original data has been safely restored.'
                );
            }
        }
    }

    /**
     * Get today's usage in minutes for a specific site
     * @param url The site URL to check
     * @returns Minutes spent on the site today
     */
    static async getTodayUsage(url: string): Promise<number> {
        try {
            const data = await this.getAllStoredData();
            const today = formatDate(new Date());
            
            const entry = data.find((item) => item.url === url);
            if (!entry || !entry.dateData[today]) {
                return 0;
            }
            
            // Return daily time in minutes (stored in seconds, so divide by 60)
            return Math.round(entry.dateData[today].dailyTime / 60);
        } catch (error) {
            console.error('Error getting today usage:', error);
            return 0;
        }
    }
}
