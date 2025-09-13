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
    Progress,
    Badge,
    Card,
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
import {StorageManager} from '../../utils/storage';

// Remove local interface; reuse imported StoredSiteLimit as SiteLimit
type SiteLimit = StoredSiteLimit;

type SiteLimitWithUsage = SiteLimit & {
    todayUsage: number; // in minutes
    isBlocked: boolean;
    percentUsed: number;
};

export default function SiteLimits() {
    const [limitsWithUsage, setLimitsWithUsage] = useState<SiteLimitWithUsage[]>([]);
    const [newUrl, setNewUrl] = useState('');
    const [newTime, setNewTime] = useState<number | ''>(30);

    const [editingUrl, setEditingUrl] = useState<string | null>(null);
    const [editTime, setEditTime] = useState<number | ''>(0);

    // Load usage data for all sites
    const loadUsageData = async (siteLimit: SiteLimit[]): Promise<SiteLimitWithUsage[]> => {
        const usagePromises = siteLimit.map(async (limit): Promise<SiteLimitWithUsage> => {
            const todayUsage = await StorageManager.getTodayUsage(limit.url);
            const percentUsed = Math.min((todayUsage / limit.time) * 100, 100);
            const isBlocked = todayUsage >= limit.time;

            return {
                ...limit,
                todayUsage,
                isBlocked,
                percentUsed,
            };
        });

        return Promise.all(usagePromises);
    };

    // Load limits and usage data from storage on component mount
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const stored = await getSiteLimits();
                if (!mounted) return;

                const withUsage = await loadUsageData(stored);
                if (!mounted) return;

                setLimitsWithUsage(withUsage);
            } catch {
                // on error, set empty list
                setLimitsWithUsage([]);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const handleAddLimit = async (event: FormEvent) => {
        event.preventDefault();
        if (newUrl && newTime) {
            if (newUrl.trim() === '' || newTime <= 0) {
                return;
            }

            const newLimit: SiteLimit = {url: newUrl.trim(), time: Number(newTime)};
            try {
                const updated = await addSiteLimit(newLimit);

                const withUsage = await loadUsageData(updated);
                setLimitsWithUsage(withUsage);

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

            const withUsage = await loadUsageData(updated);
            setLimitsWithUsage(withUsage);
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

                const withUsage = await loadUsageData(updated);
                setLimitsWithUsage(withUsage);

                setEditingUrl(null);
            } catch {
                // ignore
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingUrl(null);
    };

    const rows = limitsWithUsage.map((limitWithUsage) => {
        const isEditing = editingUrl === limitWithUsage.url;
        const remainingTime = Math.max(0, limitWithUsage.time - limitWithUsage.todayUsage);

        return (
            <Table.Tr key={limitWithUsage.url}>
                <Table.Td>{limitWithUsage.url}</Table.Td>
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
                        `${limitWithUsage.time} minutes`
                    )}
                </Table.Td>
                <Table.Td>
                    <Stack gap='xs'>
                        <Group gap='xs'>
                            <Text size='sm'>
                                {limitWithUsage.todayUsage} / {limitWithUsage.time} min
                            </Text>
                            {limitWithUsage.isBlocked ? (
                                <Badge color='red' size='sm'>
                                    Blocked
                                </Badge>
                            ) : remainingTime <= 5 ? (
                                <Badge color='orange' size='sm'>
                                    Warning
                                </Badge>
                            ) : (
                                <Badge color='green' size='sm'>
                                    Active
                                </Badge>
                            )}
                        </Group>
                        <Progress
                            value={limitWithUsage.percentUsed}
                            size='sm'
                            color={
                                limitWithUsage.isBlocked
                                    ? 'red'
                                    : limitWithUsage.percentUsed > 80
                                      ? 'orange'
                                      : 'blue'
                            }
                        />
                        {!limitWithUsage.isBlocked && (
                            <Text size='xs' c='dimmed'>
                                {remainingTime} minutes remaining
                            </Text>
                        )}
                    </Stack>
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
                            <Button
                                variant='light'
                                size='xs'
                                onClick={() => handleEdit(limitWithUsage)}>
                                Edit
                            </Button>
                            <Button
                                variant='light'
                                color='red'
                                size='xs'
                                onClick={() => handleDeleteLimit(limitWithUsage.url)}>
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

                {/* Main Content */}
                <Card shadow='sm' p='lg' radius='md' withBorder>
                    <Stack gap='xl'>
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
                                    error={
                                        newTime === '' ? 'Please enter a valid time limit' : false
                                    }
                                    onChange={(val: string | number) =>
                                        setNewTime(val === '' ? '' : Number(val))
                                    }
                                    min={1}
                                    required
                                />
                                <Button type='submit'>Add Limit</Button>
                            </Group>
                        </Box>

                        <Title order={3}>Existing Limits</Title>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Website</Table.Th>
                                    <Table.Th>Time Limit</Table.Th>
                                    <Table.Th>Today&apos;s Usage</Table.Th>
                                    <Table.Th>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>{rows}</Table.Tbody>
                        </Table>
                        {/* Empty spacer */}
                        <div style={{height: 16}} />
                    </Stack>

                    {/* Empty spacer */}
                    <div style={{height: 16}} />
                </Card>
            </Stack>
        </Container>
    );
}
