import {AreaChart, BarChart} from '@mantine/charts';
import {Card} from '@mantine/core';

import getTimeByDate from '@/utils/getTimeByDate';

export default function MainChart(data: {data: PageTimeEntry[]}) {
    const usageData = Object.entries(getTimeByDate(data.data)).map(([date, usage]) => ({
        date: date,
        usage: usage,
    }));

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
