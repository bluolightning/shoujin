import {storage} from '#imports';

export interface PomodoroSettings {
    pomodoroDuration: number; // in minutes
    shortBreakDuration: number; // in minutes
    longBreakDuration: number; // in minutes
    longBreakInterval: number; // after how many pomodoros
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    enableNotifications: boolean;
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
    pomodoroDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 3,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    enableNotifications: true,
};

export class PomodoroSettingsStorage {
    private static readonly POMODORO_SETTINGS_KEY = 'shoujin_pomodoro_settings';

    static async getSettings(): Promise<PomodoroSettings> {
        const stored = await storage.getItem<PomodoroSettings>(
            `local:${this.POMODORO_SETTINGS_KEY}`
        );
        return {...DEFAULT_POMODORO_SETTINGS, ...stored};
    }

    static async saveSetting<K extends keyof PomodoroSettings>(
        key: K,
        value: PomodoroSettings[K]
    ): Promise<void> {
        const currentSettings = await this.getSettings();
        const newSettings = {...currentSettings, [key]: value};
        await storage.setItem(`local:${this.POMODORO_SETTINGS_KEY}`, newSettings);
    }

    static async saveSettings(settings: Partial<PomodoroSettings>): Promise<void> {
        const currentSettings = await this.getSettings();
        const newSettings = {...currentSettings, ...settings};
        await storage.setItem(`local:${this.POMODORO_SETTINGS_KEY}`, newSettings);
    }

    static async resetSettings(): Promise<void> {
        await storage.setItem(`local:${this.POMODORO_SETTINGS_KEY}`, DEFAULT_POMODORO_SETTINGS);
    }
}
