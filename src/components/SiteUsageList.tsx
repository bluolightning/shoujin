import {Card, Table, Text, Title, ScrollArea, Avatar, Group, Center} from '@mantine/core';
import formatTime from '@/utils/formatTime';
import {formatDateFromSettings} from '@/utils/formatDate';
import type {PageTimeEntry} from '@/utils/storage';
import {useEffect, useState} from 'react';

export default function SiteUsageList(data: {data: PageTimeEntry[]}) {
    const usageData = data.data;
    const [formattedDates, setFormattedDates] = useState<{[key: string]: string}>({});

    function computeVisits(entry: PageTimeEntry): number {
        try {
            let total = 0;
            for (const dateInfo of Object.values(entry.dateData)) {
                for (const hourEntry of Object.values(dateInfo.hours)) {
                    total += hourEntry.visits || 0;
                }
            }
            return total || 1;
        } catch {
            return 1;
        }
    }

    useEffect(() => {
        const formatDates = async () => {
            const dateMap: {[key: string]: string} = {};
            for (const entry of usageData) {
                try {
                    const datePart = await formatDateFromSettings(entry.lastVisited);
                    const lastVisited = new Date(entry.lastVisited);
                    const timePart = !isNaN(lastVisited.getTime())
                        ? lastVisited.toLocaleTimeString()
                        : '';
                    dateMap[entry.url] = timePart ? `${datePart}, ${timePart}` : datePart;
                } catch {
                    dateMap[entry.url] = 'Invalid Date';
                }
            }
            setFormattedDates(dateMap);
        };
        formatDates();
    }, [usageData]);

    const rows = usageData.map((entry) => (
        <Table.Tr key={entry.url}>
            <Table.Td>
                <Group gap='sm' wrap='nowrap'>
                    <Avatar
                        src={entry.favicon || undefined}
                        imageProps={{loading: 'lazy'}}
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
                <Text size='sm'>{formatTime(entry.timeSpent, true)}</Text>
            </Table.Td>
            <Table.Td>
                <Text size='sm'>{formattedDates[entry.url] || 'Loading...'}</Text>
            </Table.Td>
            <Table.Td>
                <Text size='sm'>{String(computeVisits(entry))}</Text>
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
                                <Table.Th>Page Visits</Table.Th>
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
}
