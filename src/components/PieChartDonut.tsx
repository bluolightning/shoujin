import {Text, Card, Center} from '@mantine/core';
import {
    DonutChart,
    type DonutChartCell,
} from '@/components/MantineComponents/DonutChart/DonutChart';
import {useEffect, useState} from 'react';
import classes from './PieDonutChart.module.css';
import formatTime from '@/utils/formatTime';

export default function PieChartDonut(data: {data: PageTimeEntry[]}) {
    const usageData = data.data;

    const [chartData, setChartData] = useState<DonutChartCell[]>([]);

    const chartColors = ['indigo.6', 'yellow.6', 'teal.6', 'cyan.6', 'lime.6', 'orange.6'];

    useEffect(() => {
        const chartDataFetched: DonutChartCell[] = [];
        for (let i = 0; i < 6; i++) {
            chartDataFetched.push({
                name: usageData[i]?.url || 'No Data',
                value: Math.round(usageData[i]?.timeSpent) || 1,
                color: chartColors[i],
            });
        }
        setChartData(chartDataFetched);
    }, [usageData]);

    const totalTime = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <Card shadow='sm' padding='lg' radius='md' withBorder style={{height: '100%'}}>
            <Center>
                <div>
                    <Text fz='lg' fw={700} mb='md' ta='center'>
                        Top Sites
                    </Text>
                    <DonutChart
                        size={200}
                        thickness={28}
                        withLabelsLine={false}
                        labelsType='name'
                        withLabels={true}
                        data={chartData}
                        chartLabel={formatTime(totalTime)}
                        pieChartProps={{className: classes.chartWithVisibleLabels}}
                        valueFormatter={formatTime}
                    />
                </div>
            </Center>
        </Card>
    );
}
