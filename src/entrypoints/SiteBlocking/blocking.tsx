import React from 'react';
import ReactDOM from 'react-dom/client';
import {MantineProvider, Paper, Title, Text, Center} from '@mantine/core';
import '@mantine/core/styles.css';

function getParam(name: string) {
    const params = new URLSearchParams(location.search);
    return params.get(name) || '';
}

function BlockingApp() {
    const site = decodeURIComponent(getParam('site')) || 'this site';
    const minutes = decodeURIComponent(getParam('minutes') || '0');

    return (
        <MantineProvider>
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: 16,
                }}>
                <Paper
                    radius='md'
                    p='xl'
                    style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: 'inherit',
                        maxWidth: 540,
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)',
                    }}>
                    <Center style={{fontSize: 48, marginBottom: 12}}>⏰</Center>
                    <Title order={1} style={{fontWeight: 600, color: 'white'}}>
                        Time Limit Reached
                    </Title>
                    <Text size='lg' mt='sm'>
                        You have reached your daily time limit for{' '}
                        <Text component='span' fw={700} inherit>
                            {site}
                        </Text>
                    </Text>

                    <Paper
                        radius='sm'
                        p='md'
                        withBorder
                        mt='md'
                        style={{background: 'rgba(255,255,255,0.06)'}}>
                        <Text size='lg' fw={700} color='#ffeb3b'>
                            {minutes} minutes used today
                        </Text>
                    </Paper>

                    <Text size='sm' mt='md' style={{opacity: 0.9}}>
                        Come back tomorrow for a fresh start! 🌅
                    </Text>
                </Paper>
            </div>
        </MantineProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BlockingApp />
    </React.StrictMode>
);
