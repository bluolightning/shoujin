export interface SiteLimit {
    // url without protocol, e.g. "youtube.com"
    url: string;
    // minutes
    time: number;
}

const STORAGE_KEY = 'site_limits';

async function readStorage(): Promise<SiteLimit[]> {
    try {
        const result = await browser.storage.local.get(STORAGE_KEY);
        const limits = result[STORAGE_KEY];
        if (Array.isArray(limits)) return limits;
        return [];
    } catch {
        return [];
    }
}

async function writeStorage(limits: SiteLimit[]): Promise<void> {
    try {
        await browser.storage.local.set({[STORAGE_KEY]: limits});
    } catch (error) {
        console.error('Error writing site limits to storage:', error);
        throw error;
    }
}

export async function getSiteLimits(): Promise<SiteLimit[]> {
    return await readStorage();
}

export async function addSiteLimit(newLimit: SiteLimit): Promise<SiteLimit[]> {
    const limits = await readStorage();
    // If url exists, replace it; otherwise append
    const exists = limits.some((l) => l.url === newLimit.url);
    const updated = exists
        ? limits.map((l) => (l.url === newLimit.url ? newLimit : l))
        : [...limits, newLimit];
    await writeStorage(updated);
    return updated;
}

export async function updateSiteLimit(updatedLimit: SiteLimit): Promise<SiteLimit[]> {
    const limits = await readStorage();
    const updated = limits.map((l) => (l.url === updatedLimit.url ? updatedLimit : l));
    await writeStorage(updated);
    return updated;
}

export async function removeSiteLimit(url: string): Promise<SiteLimit[]> {
    const limits = await readStorage();
    const updated = limits.filter((l) => l.url !== url);
    await writeStorage(updated);
    return updated;
}

/**
 * Check if a site has exceeded its daily limit
 * @param url The site URL to check
 * @param todayUsageMinutes How many minutes have been spent on this site today
 * @returns true if the site is blocked (over limit), false otherwise
 */
export async function isSiteBlocked(url: string, todayUsageMinutes: number): Promise<boolean> {
    try {
        const limits = await getSiteLimits();
        const siteLimit = limits.find((limit) => url.includes(limit.url));

        if (!siteLimit) {
            // No limit set for this site
            return false;
        }

        return todayUsageMinutes >= siteLimit.time;
    } catch (error) {
        console.error('Error checking if site is blocked:', error);
        return false;
    }
}

/**
 * Get the remaining time for a site before it gets blocked
 * @param url The site URL to check
 * @param todayUsageMinutes How many minutes have been spent on this site today
 * @returns remaining minutes, or null if no limit is set
 */
export async function getRemainingTime(
    url: string,
    todayUsageMinutes: number
): Promise<number | null> {
    try {
        const limits = await getSiteLimits();
        const siteLimit = limits.find((limit) => url.includes(limit.url));

        if (!siteLimit) {
            return null;
        }

        return Math.max(0, siteLimit.time - todayUsageMinutes);
    } catch (error) {
        console.error('Error getting remaining time:', error);
        return null;
    }
}
