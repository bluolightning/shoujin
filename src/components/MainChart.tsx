import {AreaChart, BarChart} from '@mantine/charts';
import {Card} from '@mantine/core';
import getTimeByDate from '@/utils/getTimeByDate';
import {formatDateFromSettings} from '@/utils/formatDate';
import {useEffect, useState} from 'react';
import type {PageTimeEntry} from '@/utils/storage';
import formatTime from '@/utils/formatTime';

export default function MainChart(data: {data: PageTimeEntry[]}) {
    const [chartData, setChartData] = useState<{date: string; usage: number}[]>([]);

    useEffect(() => {
        const formatChartData = async () => {
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
        };
        formatChartData();
    }, [data.data]);

    return (
        <Card shadow='sm' padding='lg' radius='md' withBorder style={{height: '100%'}}>
            <AreaChart
                h={300}
                data={chartData}
                dataKey='date'
                series={[{name: 'usage', label: 'Time Spent', color: 'blue.6'}]}
                curveType='linear'
                tooltipAnimationDuration={200}
                valueFormatter={(value) => formatTime(value as number, false)}
            />
        </Card>
    );
}
