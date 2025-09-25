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

        // Only include sites that actually have data
        const filteredUsageData = usageData.filter((site) => site && site.timeSpent > 0);

        // Take up to 6 sites with actual data
        const sitesToShow = Math.min(filteredUsageData.length, 6);

        for (let i = 0; i < sitesToShow; i++) {
            chartDataFetched.push({
                name: filteredUsageData[i].url,
                value: Math.round(filteredUsageData[i].timeSpent),
                color: chartColors[i % chartColors.length],
            });
        }

        setChartData(chartDataFetched);
    }, [usageData]);

    const totalTime = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <Card shadow='sm' padding='lg' radius='md' withBorder style={{height: '100%'}}>
            <Center style={{height: 352}}>
                <div>
                    <Text fz='lg' fw={700} mb='md' ta='center'>
                        Top {chartData.length !== 0 ? chartData.length : ''} Sites
                    </Text>
                    {chartData.length > 0 ? (
                        <DonutChart
                            size={200}
                            thickness={28}
                            withLabelsLine={false}
                            labelsType='name'
                            withLabels={true}
                            data={chartData}
                            chartLabel={formatTime(totalTime, true)}
                            pieChartProps={{className: classes.chartWithVisibleLabels}}
                            valueFormatter={(value: number) => formatTime(value, false)}
                        />
                    ) : (
                        <Center style={{height: 200}}>
                            <Text c='dimmed' ta='center'>
                                No usage data available
                            </Text>
                        </Center>
                    )}
                </div>
            </Center>
        </Card>
    );
}
