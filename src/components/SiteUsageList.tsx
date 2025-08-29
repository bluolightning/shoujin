import {useEffect, useState} from 'react';
import {Card, Table, Text, Title, ScrollArea, Avatar, Group, Loader, Center} from '@mantine/core';
import {StorageManager, PageTimeEntry} from '@/utils/storage';
import formatTime from '@/utils/formatTime';

// Helper function to format ISO date string
const formatDate = (isoString: string): string => {
    try {
        return new Date(isoString).toLocaleString();
    } catch (error) {
        return 'Invalid Date. Error: ' + error;
    }
};

export default function SiteUsageList(data: {data: PageTimeEntry[]}) {
    const usageData = data.data;

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
                <Text size='sm'>{formatTime(entry.timeSpent)}</Text>
            </Table.Td>
            <Table.Td>
                <Text size='sm'>{formatDate(entry.lastVisited)}</Text>
            </Table.Td>
            <Table.Td>
                <Text size='sm'>{String(entry.visitCount)}</Text>
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
