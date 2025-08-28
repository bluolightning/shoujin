import {useState, useEffect} from 'react';
import {Grid, Group} from '@mantine/core';
import SiteUsageList from '@/components/SiteUsageList';
import PieChartDonut from '@/components/PieChartDonut';
import DateSelector from '@/components/DateSelector';
import MainChart from '@/components/MainChart';

import {dateRangeContext} from '@/utils/dateRangeContext';
import dayjs from 'dayjs';

export default function Dashboard() {
    const [dateRange, setDateRange] = useState({
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
    });
    useEffect(() => {
        console.log('dateRange changed to', dateRange);
    }, [dateRange]);

    return (
        <dateRangeContext.Provider value={[dateRange, setDateRange]}>
            <Group
                justify='right'
                style={{
                    height: '46px', // Match the height of the sidebar header
                    paddingBottom: 'var(--mantine-spacing-md)',
                    marginBottom: 'calc(var(--mantine-spacing-md) * 1.5)',
                    borderBottom:
                        '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
                }}>
                <div>
                    <DateSelector />
                </div>
            </Group>

            {/* Allow dateRange to be passed to children */}
            <Grid gutter='md'>
                <Grid.Col span={{base: 12, md: 5, lg: 4}}>
                    <div>
                        <MainChart />
                    </div>
                </Grid.Col>
                <Grid.Col span={{base: 12, md: 5, lg: 4}}>
                    <div>
                        <PieChartDonut />
                    </div>
                </Grid.Col>
                <Grid.Col span={{base: 12, md: 7, lg: 8}}>
                    <SiteUsageList />
                </Grid.Col>
            </Grid>
        </dateRangeContext.Provider>
    );
}
