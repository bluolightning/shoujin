'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
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

interface ChartDataPoints {
    site: string;
    time: number;
    fill: string;
}

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

let chartData: ChartDataPoints[] = [];

(async function fetchPageTimes() {
    const data = await StorageManager.getAllPageTimes();
    chartData = [
        {
            site: 'chrome',
            time: data[0].timeSpent,
            fill: 'var(--color-chrome)',
        },
        {
            site: 'safari',
            time: data[1].timeSpent,
            fill: 'var(--color-safari)',
        },
        {
            site: 'firefox',
            time: data[2].timeSpent,
            fill: 'var(--color-firefox)',
        },
        { site: 'edge', time: data[3].timeSpent, fill: 'var(--color-edge)' },
        { site: 'other', time: data[4].timeSpent, fill: 'var(--color-other)' },
    ];
})();

const chartConfig = {
    time: {
        label: 'Time',
    },
    chrome: {
        label: 'Chrome',
        color: 'hsl(var(--chart-1))',
    },
    safari: {
        label: 'bbg',
        color: 'hsl(var(--chart-2))',
    },
    firefox: {
        label: 'Firefox',
        color: 'hsl(var(--chart-3))',
    },
    edge: {
        label: 'Edge',
        color: 'hsl(var(--chart-4))',
    },
    other: {
        label: 'Other',
        color: 'hsl(var(--chart-5))',
    },
} satisfies ChartConfig;

export function DonutTestChart() {
    const totalTime = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.time, 0);
    }, []);

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Pie Chart - Donut with Text</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]">
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="time"
                            nameKey="site"
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
                                        fill="hsla(var(--foreground))">
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
                                                textAnchor="middle"
                                                dominantBaseline="middle">
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold">
                                                    {Math.round(
                                                        totalTime
                                                    ).toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground">
                                                    Time
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
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    Trending up by 5.2% this month{' '}
                    <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing total time for the last 6 months
                </div>
            </CardFooter>
        </Card>
    );
}
