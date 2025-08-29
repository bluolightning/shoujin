/*
 * This file originates from the Mantine project.
 * Original project: https://github.com/mantinedev/mantine
 * Copyright (c) 2021 Vitaly Rtishchev
 * Mantine is licensed under the MIT License. The full license text can be found at:
 * https://github.com/mantinedev/mantine/blob/master/LICENSE
 * or in the LICENSE.mantine.txt file distributed with this copy.
 */

import type {ChartSeries} from './types';

type ChartSeriesLabels = Record<string, string | undefined>;

export function getSeriesLabels(series: ChartSeries[] | undefined): ChartSeriesLabels {
    if (!series) {
        return {};
    }

    return series.reduce<ChartSeriesLabels>((acc, item) => {
        const matchFound = item.name.search(/\./);
        if (matchFound >= 0) {
            const key = item.name.substring(matchFound + 1);
            acc[key] = item.label;
            return acc;
        }
        acc[item.name] = item.label;
        return acc;
    }, {});
}
