import {useState, useEffect} from 'react';
import {
    Container,
    Card,
    Stack,
    Text,
    Group,
    ThemeIcon,
    Title,
    Center,
    Paper,
    Progress,
    Divider,
    Button,
} from '@mantine/core';
import {modals} from '@mantine/modals'; // Todo: use for settings

import {IconFlag} from '@tabler/icons-react';

// Pomodoro durations in seconds (temporary values for testing)
const durations = {
    pomodoro: 0.1 * 60,
    shortBreak: 0.2 * 60,
    longBreak: 0.3 * 60,
};

type TimerMode = keyof typeof durations;

export default function Pomodoro() {
    const [mode, setMode] = useState<TimerMode>('pomodoro');
    const [timeRemaining, setTimeRemaining] = useState(durations[mode]);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isRunning && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((time) => time - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
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
        setTimeRemaining(durations[mode]);
    }

    function selectMode(newMode: TimerMode) {
        setMode(newMode);
        setIsRunning(false);
        setTimeRemaining(durations[newMode]);
    }

    const progressValue = ((durations[mode] - timeRemaining) / durations[mode]) * 100;

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
