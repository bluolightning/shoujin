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
import {modals} from '@mantine/modals';

import {IconFlag} from '@tabler/icons-react';

// Pomodoro durations in seconds (temporary values for testing)
const pomoDuration = 0.1 * 60;
const shortBreakDuration = 0.2 * 60;
const longBreakDuration = 0.3 * 60;

export default function Pomodoro() {
    const [timeRemaining, setTimeRemaining] = useState(pomoDuration);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isRunning && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((time) => time - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            setIsRunning(false);
            resetTimer();
            // TODO: Add notification or sound for completion
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

    function resetTimer() {
        setTimeRemaining(pomoDuration);
    }

    const progressValue = ((pomoDuration - timeRemaining) / pomoDuration) * 100;

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
