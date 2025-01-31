import React from 'react';
import { DonutTestChart } from '@/components/DonutTestChart';
import { TestChart } from '@/components/TestChart';

const Dopcan = () => {
    return (
        <div>
            <h1>
                Hello from the <strong>Dopcan</strong> page of the app!
            </h1>

            <DonutTestChart />
            <TestChart />
        </div>
    );
};

export default Dopcan;
