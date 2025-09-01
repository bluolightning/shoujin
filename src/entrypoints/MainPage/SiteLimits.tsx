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

import {
    SiteLimit as StoredSiteLimit,
    getSiteLimits,
    addSiteLimit,
    updateSiteLimit,
    removeSiteLimit,
} from '../../utils/siteLimitsStorage';

// Remove local interface; reuse imported StoredSiteLimit as SiteLimit
type SiteLimit = StoredSiteLimit;

export default function SiteLimits() {
    const [limits, setLimits] = useState<SiteLimit[]>([]);
    const [newUrl, setNewUrl] = useState('');
    const [newTime, setNewTime] = useState<number | ''>(30);

    const [editingUrl, setEditingUrl] = useState<string | null>(null);
    const [editTime, setEditTime] = useState<number | ''>(0);

    // Load limits from storage on component mount
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const stored = await getSiteLimits();
                if (!mounted) return;
                setLimits(stored);
            } catch {
                // on error, set empty list
                setLimits([]);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const handleAddLimit = async (event: FormEvent) => {
        event.preventDefault();
        if (newUrl && newTime) {
            const newLimit: SiteLimit = {url: newUrl.trim(), time: Number(newTime)};
            try {
                const updated = await addSiteLimit(newLimit);
                setLimits(updated);
                setNewUrl('');
                setNewTime(30);
            } catch {
                // handle/save error silently for now
            }
        }
    };

    const handleDeleteLimit = async (urlToDelete: string) => {
        try {
            const updated = await removeSiteLimit(urlToDelete);
            setLimits(updated);
        } catch {
            // ignore errors for now
        }
    };

    const handleEdit = (limit: SiteLimit) => {
        setEditingUrl(limit.url);
        setEditTime(limit.time);
    };

    const handleUpdateLimit = async () => {
        if (editingUrl && editTime) {
            const updatedLimit: SiteLimit = {
                url: editingUrl,
                time: Number(editTime),
            };
            try {
                const updated = await updateSiteLimit(updatedLimit);
                setLimits(updated);
                setEditingUrl(null);
            } catch {
                // ignore
            }
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
                        <NumberInput
                            value={editTime}
                            onChange={(val: string | number) =>
                                setEditTime(val === '' ? '' : Number(val))
                            }
                            min={1}
                            w={100}
                        />
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
                            onChange={(val: string | number) =>
                                setNewTime(val === '' ? '' : Number(val))
                            }
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
