export interface SiteLimit {
    // url without protocol, e.g. "youtube.com"
    url: string;
    // minutes
    time: number;
}

const STORAGE_KEY = 'siteLimits';

async function readStorage(): Promise<SiteLimit[]> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw) as SiteLimit[];
        if (Array.isArray(parsed)) return parsed;
        return [];
    } catch {
        return [];
    }
}

async function writeStorage(limits: SiteLimit[]): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limits));
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
