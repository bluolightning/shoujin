interface PageTimeEntry {
    url: string;
    timeSpent: number;
    lastVisited: number;
    favicon: string | undefined;
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

            if (entry) {
                entry.timeSpent += timeSpent;
                entry.lastVisited = Date.now();
                entry.favicon = favicon;
            } else {
                data.push({
                    url,
                    timeSpent,
                    lastVisited: Date.now(),
                    favicon,
                });
            }

            data.sort((a, b) => b.timeSpent - a.timeSpent); // Sort by time spent (descending)

            await browser.storage.local.set({ [this.STORAGE_KEY]: data });
        } catch (error) {
            console.error('Error saving page time:', error);
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
            await browser.storage.local.set({ [this.STORAGE_KEY]: [] });
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }
}
