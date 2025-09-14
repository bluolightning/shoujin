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

function startTimer() {
    console.log('Start timer');
}

export default function Pomodoro() {
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
                                    value={30} // filled percent
                                    size='md'
                                    radius='xl'
                                    color='blue'
                                />
                                <Title order={1} size={64}>
                                    25:00
                                </Title>
                                <Button size='md' radius='md' onClick={startTimer}>
                                    Start
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
