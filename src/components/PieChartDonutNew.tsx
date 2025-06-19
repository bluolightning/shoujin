import {Group, Text} from '@mantine/core';
import {DonutChart} from '@mantine/charts';
import {StorageManager} from '@/modules/storage';
import {useEffect, useState} from 'react';

interface ChartDataPoints {
    name: string;
    value: number;
    color: string;
}

function PieChartDonutNew() {
    const [chartData, setChartData] = useState<ChartDataPoints[]>([]);

    useEffect(() => {
        (async function fetchPageTimes() {
            const data = await StorageManager.getAllStoredData();
            const chartDataFetched: ChartDataPoints[] = [];
            for (let i = 0; i < 6; i++) {
                chartDataFetched.push({
                    name: data[i]?.url || 'No Data' + i,
                    value: Math.round(data[i]?.timeSpent) || 1 + i,
                    color: 'blue',
                });
            }
            setChartData(chartDataFetched);
        })();
    }, []);

    return (
        <Group gap={60}>
            <div>
                <Text fz='xs' mb='sm' ta='center'>
                    Top Sites
                </Text>
                <DonutChart
                    size={160}
                    thickness={23}
                    withLabelsLine={false}
                    labelsType='percent'
                    withLabels={true}
                    data={chartData}
                    chartLabel='Seconds'
                />
            </div>
        </Group>
    );
}

export default PieChartDonutNew;
