import {useEffect, useState} from 'react';
import {Loader, Center, Card, Title} from '@mantine/core';
import {Heatmap} from '@mantine/charts';
import {StorageManager} from '@/utils/storage';
import {getTimeByDate, TimeByDateMap} from '@/utils/getTimeByDate';
import dayjs from 'dayjs';

export default function HeatmapChart() {
    const [usageData, setUsageData] = useState<TimeByDateMap>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await StorageManager.getAllStoredData();
                const structuredData = getTimeByDate(data);
                setUsageData(structuredData);
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

    return (
        <Card shadow='sm' padding='lg' radius='md' withBorder style={{height: '100%'}}>
            <Title order={3} mb='md'>
                Heatmap
            </Title>
            <Heatmap
                data={usageData}
                withTooltip
                getTooltipLabel={({date, value}) =>
                    `${dayjs(date).format('DD MMM, YYYY')} - ${value === null || value === 0 ? 'No time spent' : `${value} second${value > 1 ? 's' : ''}`}`
                }
            />
        </Card>
    );
}
