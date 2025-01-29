import React from 'react';
import { PieChartDonut } from '@/components/PieChartDonut';

const Dashboard = () => {
    return (
        <div>
            <h1>
                Hello from the <strong>Dashboard</strong> main page of the app!
                <PieChartDonut />
            </h1>
        </div>
    );
};

export default Dashboard;
