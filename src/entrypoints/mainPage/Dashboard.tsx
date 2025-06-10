import React from 'react';
import { Grid } from '@mantine/core';
import { PieChartDonut } from '@/components/PieChartDonut';
import SiteUsageList from '@/components/SiteUsageList';

const Dashboard = () => {
    return (
        <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 5, lg: 4 }}>
                <PieChartDonut />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 7, lg: 8 }}>
                <SiteUsageList />
            </Grid.Col>
        </Grid>
    );
};

export default Dashboard;
