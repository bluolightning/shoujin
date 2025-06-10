'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

import { StorageManager } from '@/modules/storage';

interface LabelProps {
    cx?: number;
    cy?: number;
    x?: number;
    y?: number;
    textAnchor?: string;
    dominantBaseline?: string;
    payload: {
        site?: string;
    };
}

interface ChartDataPoints {
    site: string;
    time: number;
    fill: string;
}

let chartData: ChartDataPoints[] = [];

let chartConfig: ChartConfig = {
    first: { label: '', color: '' },
    second: { label: '', color: '' },
    third: { label: '', color: '' },
    fourth: { label: '', color: '' },
    fifth: { label: '', color: '' },
    sixth: { label: '', color: '' },
};

(async function fetchPageTimes() {
    const data = await StorageManager.getAllStoredData();
    chartData = [];

    for (let i = 0; i < 6; i++) {
        let itemNum = 'first';

        if (i === 1) {
            itemNum = 'second';
        } else if (i === 2) {
            itemNum = 'third';
        } else if (i === 3) {
            itemNum = 'fourth';
        } else if (i === 4) {
            itemNum = 'fifth';
        } else if (i === 5) {
            itemNum = 'sixth';
        }

        chartData.push({
            site: data[i]?.url || 'No Data',
            time: Math.round(data[i]?.timeSpent) || 1,
            fill: `var(--color-${itemNum})`,
        });
    }

    chartConfig = {
        first: {
            label: 'Chrome',
            color: 'hsl(var(--chart-1))',
        },
        second: {
            label: 'bbg',
            color: 'hsl(var(--chart-2))',
        },
        third: {
            label: 'Firefox',
            color: 'hsl(var(--chart-3))',
        },
        fourth: {
            label: 'Edge',
            color: 'hsl(var(--chart-4))',
        },
        fifth: {
            label: 'Fifth',
            color: 'hsl(var(--chart-5))',
        },
        sixth: {
            label: 'Sixth',
            color: 'hsl(var(--chart-6))',
        },
    } satisfies ChartConfig;
})();

export function PieChartDonut() {
    const totalTime = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.time, 0);
    }, []);

    return (
        <Card className='flex flex-col'>
            <CardHeader className='items-center pb-0'>
                <CardTitle>Top 6 Used Sites</CardTitle>
                <CardDescription>Date - Date</CardDescription>
            </CardHeader>
            <CardContent className='flex-1 pb-0'>
                <ChartContainer
                    config={chartConfig}
                    className='mx-auto aspect-square max-h-[250px]'>
                    <PieChart
                        {...{
                            overflow: 'visible',
                        }}>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey='time'
                            nameKey='site'
                            innerRadius={60}
                            strokeWidth={5}
                            labelLine={false}
                            label={({ payload, ...props }: LabelProps) => {
                                return (
                                    <text
                                        cx={props.cx}
                                        cy={props.cy}
                                        x={props.x}
                                        y={props.y}
                                        textAnchor={props.textAnchor}
                                        dominantBaseline={
                                            props.dominantBaseline
                                        }
                                        fill='hsla(var(--foreground))'>
                                        {payload.site}
                                    </text>
                                );
                            }}>
                            <Label
                                content={({ viewBox }) => {
                                    if (
                                        viewBox &&
                                        'cx' in viewBox &&
                                        'cy' in viewBox
                                    ) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor='middle'
                                                dominantBaseline='middle'>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className='fill-foreground text-3xl font-bold'>
                                                    {Math.round(
                                                        totalTime
                                                    ).toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className='fill-muted-foreground'>
                                                    Seconds
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className='flex-col gap-2 text-sm'>
                <div className='flex items-center gap-2 font-medium leading-none'>
                    Trending up/down by x% this month
                    <TrendingUp className='h-4 w-4' />
                    <TrendingDown className='h-4 w-4' />
                </div>
                <div className='leading-none text-muted-foreground'>
                    Showing total time for the last x months
                </div>
            </CardFooter>
        </Card>
    );
}
