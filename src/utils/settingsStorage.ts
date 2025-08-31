import {storage} from '#imports';

export interface AppSettings {
    // Tracking Settings
    trackingEnabled: boolean;
    idleTimeout: number;
    minimumVisitTime: number;
    trackInPrivate: boolean;

    // Privacy Settings
    collectFavicons: boolean;
    anonymizeUrls: boolean;
    retentionPeriod: string;

    // Display Settings
    dateFormat: string;
    timeFormat: string;
    chartTheme: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
    trackingEnabled: true,
    idleTimeout: 15,
    minimumVisitTime: 5,
    trackInPrivate: false,
    collectFavicons: true,
    anonymizeUrls: false,
    retentionPeriod: 'unlimited',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    chartTheme: 'auto',
};

export class SettingsStorage {
    private static readonly SETTINGS_KEY = 'shoujin_settings';

    static async getSettings(): Promise<AppSettings> {
        const stored = await storage.getItem<AppSettings>(`local:${this.SETTINGS_KEY}`);
        return {...DEFAULT_SETTINGS, ...stored};
    }

    static async saveSetting<K extends keyof AppSettings>(
        key: K,
        value: AppSettings[K]
    ): Promise<void> {
        const currentSettings = await this.getSettings();
        const newSettings = {...currentSettings, [key]: value};
        await storage.setItem(`local:${this.SETTINGS_KEY}`, newSettings);

        // Notify other parts of the extension about the change
        this.notifySettingChange(key, value);
    }

    static async saveSettings(settings: Partial<AppSettings>): Promise<void> {
        const currentSettings = await this.getSettings();
        const newSettings = {...currentSettings, ...settings};
        await storage.setItem(`local:${this.SETTINGS_KEY}`, newSettings);

        // Notify about all changed settings
        Object.entries(settings).forEach(([key, value]) => {
            this.notifySettingChange(key as keyof AppSettings, value);
        });
    }

    private static notifySettingChange<K extends keyof AppSettings>(
        key: K,
        value: AppSettings[K]
    ): void {
        // Send message to background script about setting change
        browser.runtime
            .sendMessage({
                type: 'setting-changed',
                key,
                value,
            })
            .catch(() => {
                // Ignore errors if background script isn't ready
            });
    }

    static async resetSettings(): Promise<void> {
        await storage.setItem(`local:${this.SETTINGS_KEY}`, DEFAULT_SETTINGS);

        // Notify about reset
        browser.runtime
            .sendMessage({
                type: 'settings-reset',
            })
            .catch(() => {
                // Ignore errors if background script isn't ready
            });
    }
}
