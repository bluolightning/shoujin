import React, {useEffect, useState} from 'react';
import {Card, Table, Text, Title, ScrollArea, Avatar, Group, Loader, Center} from '@mantine/core';
import {StorageManager} from '@/modules/storage';
import type {PageTimeEntry} from '@/modules/storage';

// Helper function to format seconds into a human-readable string (e.g., 1h 23m 45s)
const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    // Always show seconds if hours and minutes are zero, or if there are any seconds
    if (seconds > 0 || (hours === 0 && minutes === 0)) result += `${seconds}s`;

    return result.trim() || '0s'; // Handle case where totalSeconds is 0
};

// Helper function to format ISO date string
const formatDate = (isoString: string): string => {
    try {
        return new Date(isoString).toLocaleString();
    } catch (error) {
        return 'Invalid Date. Error: ' + error;
    }
};

const SiteUsageList = () => {
    const [usageData, setUsageData] = useState<PageTimeEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await StorageManager.getAllStoredData();
                // Sort data by timeSpent in descending order
                const sortedData = data.sort((a, b) => b.timeSpent - a.timeSpent);
                setUsageData(sortedData);
            } catch (error) {
                console.error('Failed to fetch usage data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <Center style={{height: '100%'}}>
                <Loader />
            </Center>
        );
    }

    const rows = usageData.map((entry) => (
        <Table.Tr key={entry.url}>
            <Table.Td>
                <Group gap='sm' wrap='nowrap'>
                    <Avatar
                        src={entry.favicon || undefined}
                        alt={entry.url}
                        size='sm'
                        radius='xl'
                        style={{
                            backgroundColor:
                                'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))',
                            border: '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        }}
                    />
                    <Text size='sm' truncate>
                        {entry.url}
                    </Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Text size='sm'>{formatTime(entry.timeSpent)}</Text>
            </Table.Td>
            <Table.Td>
                <Text size='sm'>{formatDate(entry.lastVisited)}</Text>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Card shadow='sm' padding='lg' radius='md' withBorder style={{height: '100%'}}>
            <Title order={3} mb='md'>
                Site Usage Details
            </Title>
            {usageData.length > 0 ? (
                <ScrollArea h={450}>
                    {' '}
                    {/* Adjust height as needed */}
                    <Table striped highlightOnHover withTableBorder verticalSpacing='sm'>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Site</Table.Th>
                                <Table.Th>Time Spent</Table.Th>
                                <Table.Th>Last Visited</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                </ScrollArea>
            ) : (
                <Center style={{height: 200}}>
                    <Text c='dimmed'>
                        No usage data available yet. Start browsing to see your stats!
                    </Text>
                </Center>
            )}
        </Card>
    );
};

export default SiteUsageList;
