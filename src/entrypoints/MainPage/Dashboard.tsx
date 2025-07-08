import React from 'react';
import {Grid} from '@mantine/core';
import SiteUsageList from '@/components/SiteUsageList';
import PieChartDonut from '@/components/PieChartDonut';
import DateSelector from '@/components/DateSelector';

export default function Dashboard() {
    return (
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
    );
}
