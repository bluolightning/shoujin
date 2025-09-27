import {useEffect, useState} from 'react';
import {Loader, Center, Card, Title} from '@mantine/core';
import {Heatmap} from '@mantine/charts';
import {StorageManager} from '@/utils/storage';
import getTimeByDate, {TimeByDateMap} from '@/utils/getTimeByDate';
import {formatDateFromSettings} from '@/utils/formatDate';
import formatTime from '@/utils/formatTime';

export default function HeatmapChart() {
    const [usageData, setUsageData] = useState<TimeByDateMap>({});
    const [loading, setLoading] = useState(true);
    const [formattedDateCache, setFormattedDateCache] = useState<{[key: string]: string}>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await StorageManager.getAllStoredData(); // Uses full time-range data due to the nature of the heatmap
                const structuredData = getTimeByDate(data);
                setUsageData(structuredData);

                // Pre-format all dates in the data
                const dateCache: {[key: string]: string} = {};
                const uniqueDates = Object.keys(structuredData);
                await Promise.all(
                    uniqueDates.map(async (date) => {
                        try {
                            dateCache[date] = await formatDateFromSettings(date);
                        } catch {
                            dateCache[date] = date; // fallback to original date
                        }
                    })
                );
                setFormattedDateCache(dateCache);
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

    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    const endOfYear = new Date(today.getFullYear(), 11, 31);

    return (
        <Card shadow='sm' padding='lg' radius='md' withBorder style={{height: '100%'}}>
            <Title order={3} mb='md'>
                Heatmap
            </Title>
            <Heatmap
                data={usageData}
                startDate={sixMonthsAgo}
                endDate={endOfYear}
                rectSize={11}
                splitMonths
                withTooltip
                withWeekdayLabels
                withMonthLabels
                getTooltipLabel={({date, value}) =>
                    `${formattedDateCache[date] || date} - ${value === null || value === 0 ? 'No time spent' : `${formatTime(value, false)}`}`
                }
            />
        </Card>
    );
}
