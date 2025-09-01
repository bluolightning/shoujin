import {
    Box,
    Button,
    Container,
    Group,
    NumberInput,
    Stack,
    Table,
    TextInput,
    Title,
    ThemeIcon,
    Text,
} from '@mantine/core';
import {FormEvent, useEffect, useState} from 'react';
import {IconClockCog} from '@tabler/icons-react';

// This would come from site limits storage
// For now, using mock data.
const initialLimits: SiteLimit[] = [
    {url: 'youtube.com', time: 60},
    {url: 'twitter.com', time: 30},
];

interface SiteLimit {
    url: string;
    time: number; // in minutes
}

export default function SiteLimits() {
    const [limits, setLimits] = useState<SiteLimit[]>([]);
    const [newUrl, setNewUrl] = useState('');
    const [newTime, setNewTime] = useState<number | ''>(30);

    const [editingUrl, setEditingUrl] = useState<string | null>(null);
    const [editTime, setEditTime] = useState<number | ''>(0);

    // TODO: Load limits from storage on component mount
    useEffect(() => {
        // async function loadLimits() {
        //   const storedLimits = ...;
        //   setLimits(storedLimits);
        // }
        // loadLimits();
        setLimits(initialLimits); // Using mock data for now
    }, []);

    const handleAddLimit = (event: FormEvent) => {
        event.preventDefault();
        if (newUrl && newTime) {
            const newLimit: SiteLimit = {url: newUrl, time: Number(newTime)};
            // TODO: Persist with StorageManager.addSiteLimit(newLimit)
            setLimits([...limits, newLimit]);
            setNewUrl('');
            setNewTime(30);
        }
    };

    const handleDeleteLimit = (urlToDelete: string) => {
        // TODO: Persist with StorageManager.removeSiteLimit(urlToDelete)
        setLimits(limits.filter((limit) => limit.url !== urlToDelete));
    };

    const handleEdit = (limit: SiteLimit) => {
        setEditingUrl(limit.url);
        setEditTime(limit.time);
    };

    const handleUpdateLimit = () => {
        if (editingUrl && editTime) {
            const updatedLimit: SiteLimit = {
                url: editingUrl,
                time: Number(editTime),
            };
            // TODO: Persist with StorageManager.updateSiteLimit(updatedLimit)
            setLimits(limits.map((limit) => (limit.url === editingUrl ? updatedLimit : limit)));
            setEditingUrl(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingUrl(null);
    };

    const rows = limits.map((limit) => {
        const isEditing = editingUrl === limit.url;
        return (
            <Table.Tr key={limit.url}>
                <Table.Td>{limit.url}</Table.Td>
                <Table.Td>
                    {isEditing ? (
                        <NumberInput value={editTime} onChange={setEditTime} min={1} w={100} />
                    ) : (
                        `${limit.time} minutes`
                    )}
                </Table.Td>
                <Table.Td>
                    {isEditing ? (
                        <Group>
                            <Button onClick={handleUpdateLimit}>Save</Button>
                            <Button variant='default' onClick={handleCancelEdit}>
                                Cancel
                            </Button>
                        </Group>
                    ) : (
                        <Group>
                            <Button variant='light' size='xs' onClick={() => handleEdit(limit)}>
                                Edit
                            </Button>
                            <Button
                                variant='light'
                                color='red'
                                size='xs'
                                onClick={() => handleDeleteLimit(limit.url)}>
                                Delete
                            </Button>
                        </Group>
                    )}
                </Table.Td>
            </Table.Tr>
        );
    });

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
                            <IconClockCog size='1.5rem' />
                        </ThemeIcon>
                        <div>
                            <Title order={1}>Site Limits</Title>
                            <Text c='dimmed'>Configure time limits for sites</Text>
                        </div>
                    </Group>
                </div>

                <Box component='form' onSubmit={handleAddLimit}>
                    <Group align='flex-end'>
                        <TextInput
                            placeholder='e.g., youtube.com'
                            value={newUrl}
                            onChange={(event) => setNewUrl(event.currentTarget.value)}
                            label='Website URL'
                            required
                        />
                        <NumberInput
                            label='Time limit (minutes)'
                            value={newTime}
                            onChange={setNewTime}
                            min={1}
                            required
                        />
                        <Button type='submit'>Add Limit</Button>
                    </Group>
                </Box>

                <Title order={3} mt='lg'>
                    Existing Limits
                </Title>
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Website</Table.Th>
                            <Table.Th>Time Limit</Table.Th>
                            <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </Stack>
        </Container>
    );
}
