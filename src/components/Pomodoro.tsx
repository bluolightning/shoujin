import {useState, useEffect} from 'react';
import {
    Container,
    Card,
    Stack,
    Text,
    Group,
    ThemeIcon,
    Title,
    Progress,
    Divider,
    Button,
    ActionIcon,
    Loader,
    Center,
} from '@mantine/core';
import {modals} from '@mantine/modals';
import {notifications} from '@mantine/notifications';

import {IconFlag, IconSettings} from '@tabler/icons-react';
import {
    PomodoroSettings,
    DEFAULT_POMODORO_SETTINGS,
    PomodoroSettingsStorage,
} from '../utils/pomodoroSettingsStorage';
import PomodoroSettingsModal from './PomodoroSettingsModal';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export default function Pomodoro() {
    const [mode, setMode] = useState<TimerMode>('pomodoro');
    const [timeRemaining, setTimeRemaining] = useState(25 * 60); // in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO_SETTINGS);
    const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
    const [completedPomodoros, setCompletedPomodoros] = useState(0);

    // Load settings on component mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Update timer when mode or settings change
    useEffect(() => {
        if (isSettingsLoaded) {
            const duration = getDurationForMode(mode);
            setTimeRemaining(duration);
            setIsRunning(false);
        }
    }, [mode, settings, isSettingsLoaded]);

    async function loadSettings() {
        try {
            const savedSettings = await PomodoroSettingsStorage.getSettings();
            setSettings(savedSettings);
            setIsSettingsLoaded(true);
        } catch (error) {
            console.error('Failed to load Pomodoro settings:', error);
            setSettings(DEFAULT_POMODORO_SETTINGS);
            setIsSettingsLoaded(true);
        }
    }

    function getDurationForMode(mode: TimerMode): number {
        switch (mode) {
            case 'pomodoro':
                return settings.pomodoroDuration * 60;
            case 'shortBreak':
                return settings.shortBreakDuration * 60;
            case 'longBreak':
                return settings.longBreakDuration * 60;
            default:
                return settings.pomodoroDuration * 60;
        }
    }

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isRunning && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((time: number) => time - 1);
            }, 1000);
        } else if (timeRemaining === 0 && isRunning) {
            setIsRunning(false);
            onTimerEnd();
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isRunning, timeRemaining]);

    function toggleTimer() {
        setIsRunning((prev) => !prev);
    }

    function formatTime(seconds: number) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
            .toString()
            .padStart(2, '0')}`;
    }

    function onTimerEnd() {
        // Show notification if enabled
        if (settings.enableNotifications) {
            try {
                browser.notifications.create({
                    type: 'basic',
                    iconUrl: browser.runtime.getURL('/icons/128.png'),
                    title: mode === 'pomodoro' ? 'Pomodoro Complete!' : 'Break Over!',
                    message:
                        mode === 'pomodoro'
                            ? "Great work! It's time for a break."
                            : 'Time to get back to work!',
                });
            } catch (error) {
                console.log('Notification error:', error);
                notifications.show({
                    title: 'Notification Error',
                    message: 'Failed to send Pomodoro timer end notification.',
                    color: 'red',
                    withCloseButton: false,
                    id: 'pomo-notification-error',
                    onClick: () => {
                        notifications.hide('pomo-notification-error');
                    },
                });
            }
        }

        // Handle pomodoro completion and auto-transitions
        if (mode === 'pomodoro') {
            const newCompletedPomodoros = completedPomodoros + 1;
            setCompletedPomodoros(newCompletedPomodoros);

            // Determine next break type
            const shouldTakeLongBreak = newCompletedPomodoros % settings.longBreakInterval === 0;
            const nextMode = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';

            if (settings.autoStartBreaks) {
                selectMode(nextMode);
                setIsRunning(true);
            } else {
                selectMode(nextMode);
            }
        } else {
            // Break ended
            if (settings.autoStartPomodoros) {
                selectMode('pomodoro');
                setIsRunning(true);
            } else {
                selectMode('pomodoro');
            }
        }

        setTimeRemaining(getDurationForMode(mode));
    }

    function selectMode(newMode: TimerMode) {
        setMode(newMode);
        setIsRunning(false);
        if (isSettingsLoaded) {
            setTimeRemaining(getDurationForMode(newMode));
        }
    }

    function onSettingsChange(newSettings: PomodoroSettings) {
        setSettings(newSettings);
    }

    const currentDuration = getDurationForMode(mode);
    const progressValue =
        currentDuration > 0 ? ((currentDuration - timeRemaining) / currentDuration) * 100 : 0;

    function openSettingsModal() {
        modals.open({
            title: 'Pomodoro Settings',
            size: 'lg',
            children: (
                <PomodoroSettingsModal
                    onSettingsChange={onSettingsChange}
                    onClose={() => modals.closeAll()}
                />
            ),
        });
    }

    if (!isSettingsLoaded) {
        return (
            <Center style={{height: '100%'}}>
                <Loader />
            </Center>
        );
    }

    return (
        <Container size='lg' py='xl'>
            <Stack gap='xl'>
                {/* Header */}
                <div>
                    <Group>
                        <ThemeIcon
                            size='xl'
                            variant='gradient'
                            gradient={{from: 'blue', to: 'violet'}}>
                            <IconFlag size='1.5rem' />
                        </ThemeIcon>
                        <div>
                            <Title order={1}>Pomodoro</Title>
                            <Text c='dimmed'>Pomodoro Timer</Text>
                        </div>
                    </Group>
                </div>

                {/* Main Content */}
                <Card shadow='sm' p='lg' radius='md' withBorder>
                    <ActionIcon
                        variant='subtle'
                        size='lg'
                        onClick={openSettingsModal}
                        style={{position: 'absolute', top: 16, right: 16}}>
                        <IconSettings />
                    </ActionIcon>
                    <Stack align='center'>
                        <Group>
                            <Button
                                variant={mode === 'pomodoro' ? 'filled' : 'outline'}
                                onClick={() => selectMode('pomodoro')}>
                                Pomodoro
                            </Button>
                            <Button
                                variant={mode === 'shortBreak' ? 'filled' : 'outline'}
                                onClick={() => selectMode('shortBreak')}>
                                Short Break
                            </Button>
                            <Button
                                variant={mode === 'longBreak' ? 'filled' : 'outline'}
                                onClick={() => selectMode('longBreak')}>
                                Long Break
                            </Button>
                        </Group>
                        <Card
                            shadow='sm'
                            p='lg'
                            radius='md'
                            withBorder
                            style={{width: 360, height: 220}}>
                            <Stack align='center'>
                                <Progress
                                    style={{width: '100%'}} // Prevent disappearing in the Stack component
                                    value={progressValue} // filled percent
                                    size='md'
                                    radius='xl'
                                    color='blue'
                                />
                                <Title order={1} size={64}>
                                    {formatTime(timeRemaining)}
                                </Title>
                                <Button size='md' radius='md' onClick={toggleTimer}>
                                    {isRunning ? 'Pause' : 'Start'}
                                </Button>
                            </Stack>
                        </Card>

                        <Divider />

                        <Text>Tasks</Text>
                    </Stack>
                </Card>

                {/* Empty spacer */}
                <div style={{height: 16}} />
            </Stack>
        </Container>
    );
}
