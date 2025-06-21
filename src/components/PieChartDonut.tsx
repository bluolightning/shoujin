import {Text, Card, Center} from '@mantine/core';
import {DonutChart, DonutChartCell} from '@/components/MantineComponents/DonutChart/DonutChart';
import {StorageManager} from '@/modules/storage';
import {useEffect, useState} from 'react';
import classes from './PieDonutChart.module.css';

function PieChartDonut() {
    const [chartData, setChartData] = useState<DonutChartCell[]>([]);

    const chartColors = ['indigo.6', 'yellow.6', 'teal.6', 'cyan.6', 'lime.6', 'orange.6'];

    useEffect(() => {
        (async function fetchPageTimes() {
            const data = await StorageManager.getAllStoredData();
            const chartDataFetched: DonutChartCell[] = [];
            for (let i = 0; i < 6; i++) {
                chartDataFetched.push({
                    name: data[i]?.url || 'No Data',
                    value: Math.round(data[i]?.timeSpent) || 1,
                    color: chartColors[i],
                });
            }
            setChartData(chartDataFetched);
        })();
    }, []);

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
                        chartLabel='Seconds'
                        pieChartProps={{className: classes.chartWithVisibleLabels}}
                    />
                </div>
            </Center>
        </Card>
    );
}

export default PieChartDonut;
