import {useState, useEffect} from 'react';
import {Grid} from '@mantine/core';
import SiteUsageList from '@/components/SiteUsageList';
import PieChartDonut from '@/components/PieChartDonut';
import DateSelector from '@/components/DateSelector';

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
            {/* Allow dateRange to be passed to children */}
            <Grid gutter='md'>
                <Grid.Col span={{base: 12, md: 5, lg: 4}}>
                    <div>
                        <DateSelector />
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
