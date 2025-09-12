import {AreaChart, BarChart} from '@mantine/charts';
import {Card, SegmentedControl, Stack, Title} from '@mantine/core';
import getTimeByDate from '@/utils/getTimeByDate';
import getTimeByHour from '@/utils/getTimeByHour';
import {formatDateFromSettings} from '@/utils/formatDate';
import {useEffect, useState} from 'react';
import type {PageTimeEntry} from '@/utils/storage';
import formatTime from '@/utils/formatTime';

export default function MainChart(data: {data: PageTimeEntry[]}) {
    const [chartData, setChartData] = useState<{date: string; usage: number}[]>([]);
    const [hourlyData, setHourlyData] = useState<{hour: string; usage: number}[]>([]);
    const [viewMode, setViewMode] = useState<'date' | 'hour'>('date');

    useEffect(() => {
        const formatChartData = async () => {
            // Process date-based data
            const timeByDate = getTimeByDate(data.data);
            const formattedData = await Promise.all(
                Object.entries(timeByDate).map(async ([date, usage]) => {
                    try {
                        const formattedDate = await formatDateFromSettings(date);
                        return {date: formattedDate, usage};
                    } catch {
                        return {date, usage}; // fallback to original date
                    }
                })
            );
            setChartData(formattedData);

            // Process hourly data
            const timeByHour = getTimeByHour(data.data);
            const hourlyFormattedData = Object.entries(timeByHour).map(([hourKey, usage]) => {
                const hour = parseInt(hourKey.replace('h', ''));
                const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
                return {hour: hourLabel, usage};
            });
            setHourlyData(hourlyFormattedData);
        };
        formatChartData();
    }, [data.data]);

    return (
        <Card shadow='sm' padding='lg' radius='md' withBorder style={{height: '100%'}}>
            <Stack gap='md'>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                    <Title order={3}>Usage Chart</Title>
                    <SegmentedControl
                        value={viewMode}
                        onChange={(value) => setViewMode(value as 'date' | 'hour')}
                        data={[
                            {label: 'By Date', value: 'date'},
                            {label: 'By Hour', value: 'hour'},
                        ]}
                    />
                </div>

                {viewMode === 'date' ? (
                    <AreaChart
                        h={300}
                        data={chartData}
                        dataKey='date'
                        series={[{name: 'usage', label: 'Time Spent', color: 'blue.6'}]}
                        curveType='linear'
                        tooltipAnimationDuration={200}
                        valueFormatter={(value) => formatTime(value as number, false)}
                    />
                ) : (
                    <BarChart
                        h={300}
                        data={hourlyData}
                        dataKey='hour'
                        series={[{name: 'usage', label: 'Time Spent', color: 'teal.6'}]}
                        tooltipAnimationDuration={200}
                        valueFormatter={(value) => formatTime(value as number, false)}
                    />
                )}
            </Stack>
        </Card>
    );
}
