import {useEffect, useState} from 'react';
import {AreaChart, BarChart} from '@mantine/charts';
import {Card, Loader, Center} from '@mantine/core';

import {StorageManager} from '@/utils/storage';
import getTimeByDate from '@/utils/getTimeByDate';

export default function MainChart(data: {data: PageTimeEntry[]}) {
    const [usageData, setUsageData] = useState<{date: string; usage: number}[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await StorageManager.getAllStoredData();

                const structuredData = Object.entries(getTimeByDate(data)).map(([date, usage]) => ({
                    date: date,
                    usage: usage,
                }));

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
            <AreaChart
                h={300}
                data={usageData}
                dataKey='date'
                series={[{name: 'usage', color: 'blue.6'}]}
                curveType='linear'
                tooltipAnimationDuration={200}
            />
        </Card>
    );
}
