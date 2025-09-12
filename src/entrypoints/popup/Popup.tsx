import '@mantine/core/styles.css';
import {Button, Paper, Stack, Title} from '@mantine/core';

export default function Popup() {
    const openNewTab = () => {
        browser.tabs.create({
            url: browser.runtime.getURL('/MainPage.html'),
        });
    };

    return (
        <Paper shadow='md' p='lg' radius='md' withBorder style={{minWidth: '300px'}}>
            <Stack align='center'>
                <Title order={2}>Shoujin</Title>
                <Button variant='filled' onClick={openNewTab} fullWidth>
                    Open Dashboard
                </Button>
            </Stack>
        </Paper>
    );
}
