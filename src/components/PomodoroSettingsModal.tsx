import {useState, useEffect} from 'react';
import {
    Stack,
    Text,
    NumberInput,
    Checkbox,
    Button,
    Group,
    Divider,
    Alert,
    Loader,
    Center,
} from '@mantine/core';
import {notifications} from '@mantine/notifications';
import {IconInfoCircle} from '@tabler/icons-react';
import {
    PomodoroSettings,
    DEFAULT_POMODORO_SETTINGS,
    PomodoroSettingsStorage,
} from '../utils/pomodoroSettingsStorage';

interface PomodoroSettingsModalProps {
    onSettingsChange?: (settings: PomodoroSettings) => void;
    onClose?: () => void;
}

export default function PomodoroSettingsModal({
    onSettingsChange,
    onClose,
}: PomodoroSettingsModalProps) {
    const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            const savedSettings = await PomodoroSettingsStorage.getSettings();
            setSettings(savedSettings);
        } catch (error) {
            console.error('Failed to load Pomodoro settings:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to load settings',
                color: 'red',
                withCloseButton: false,
                id: 'pomodoro-settings-load-error',
                onClick: () => {
                    notifications.hide('pomodoro-settings-load-error');
                },
            });
        } finally {
            setIsLoading(false);
        }
    }

    function updateSetting<K extends keyof PomodoroSettings>(key: K, value: PomodoroSettings[K]) {
        setSettings((prev) => ({...prev, [key]: value}));
    }

    async function handleSave() {
        setIsSaving(true);
        try {
            await PomodoroSettingsStorage.saveSettings(settings);
            onSettingsChange?.(settings);
            notifications.show({
                title: 'Success',
                message: 'Settings saved successfully',
                color: 'green',
                withCloseButton: false,
                id: 'pomodoro-settings-saved',
                onClick: () => {
                    notifications.hide('pomodoro-settings-saved');
                },
            });
            onClose?.();
        } catch (error) {
            console.error('Failed to save Pomodoro settings:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to save settings',
                color: 'red',
                withCloseButton: false,
                id: 'pomodoro-settings-save-error',
                onClick: () => {
                    notifications.hide('pomodoro-settings-save-error');
                },
            });
        } finally {
            setIsSaving(false);
        }
    }

    async function handleReset() {
        try {
            await PomodoroSettingsStorage.resetSettings();
            const resetSettings = await PomodoroSettingsStorage.getSettings();
            setSettings(resetSettings);
            onSettingsChange?.(resetSettings);
            notifications.show({
                title: 'Success',
                message: 'Settings reset to defaults',
                color: 'green',
                withCloseButton: false,
                id: 'pomodoro-settings-reset',
                onClick: () => {
                    notifications.hide('pomodoro-settings-reset');
                },
            });
        } catch (error) {
            console.error('Failed to reset Pomodoro settings:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to reset settings',
                color: 'red',
                withCloseButton: false,
                id: 'pomodoro-settings-reset-error',
                onClick: () => {
                    notifications.hide('pomodoro-settings-reset-error');
                },
            });
        }
    }

    function handleCancel() {
        onClose?.();
    }

    if (isLoading) {
        return (
            <Center style={{height: '100%'}}>
                <Loader />
            </Center>
        );
    }

    return (
        <Stack gap='md' p='sm'>
            <Alert icon={<IconInfoCircle size='1rem' />} title='Timer Durations' color='blue'>
                Configure how long each timer phase should last. Changes will apply to new timer
                sessions.
            </Alert>

            <Stack gap='sm'>
                <NumberInput
                    label='Pomodoro Duration'
                    description='Focus time in minutes'
                    value={settings.pomodoroDuration}
                    onChange={(value) => updateSetting('pomodoroDuration', Number(value) || 25)}
                    min={1}
                    max={90}
                    step={1}
                />
                <NumberInput
                    label='Short Break Duration'
                    description='Short break time in minutes'
                    value={settings.shortBreakDuration}
                    onChange={(value) => updateSetting('shortBreakDuration', Number(value) || 5)}
                    min={1}
                    max={30}
                    step={1}
                />
                <NumberInput
                    label='Long Break Duration'
                    description='Long break time in minutes'
                    value={settings.longBreakDuration}
                    onChange={(value) => updateSetting('longBreakDuration', Number(value) || 15)}
                    min={1}
                    max={60}
                    step={1}
                />
                <NumberInput
                    label='Long Break Interval'
                    description='Take a long break after this many pomodoros'
                    value={settings.longBreakInterval}
                    onChange={(value) => updateSetting('longBreakInterval', Number(value) || 4)}
                    min={2}
                    max={10}
                    step={1}
                />
            </Stack>

            <Divider />

            <Stack gap='sm'>
                <Text fw={500}>Automation</Text>
                <Checkbox
                    label='Auto-start breaks'
                    description='Automatically start break timers when pomodoro ends'
                    checked={settings.autoStartBreaks}
                    onChange={(event) =>
                        updateSetting('autoStartBreaks', event.currentTarget.checked)
                    }
                />
                <Checkbox
                    label='Auto-start pomodoros'
                    description='Automatically start pomodoro timers when break ends'
                    checked={settings.autoStartPomodoros}
                    onChange={(event) =>
                        updateSetting('autoStartPomodoros', event.currentTarget.checked)
                    }
                />
                <Checkbox
                    label='Enable notifications'
                    description='Show browser notifications when timers end'
                    checked={settings.enableNotifications}
                    onChange={(event) =>
                        updateSetting('enableNotifications', event.currentTarget.checked)
                    }
                />
            </Stack>

            <Divider />

            <Group justify='space-between'>
                <Button variant='subtle' onClick={handleReset}>
                    Reset to Defaults
                </Button>
                <Group>
                    <Button variant='outline' onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} loading={isSaving}>
                        Save Settings
                    </Button>
                </Group>
            </Group>
        </Stack>
    );
}
