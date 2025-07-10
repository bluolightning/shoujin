import {createContext} from 'react';

interface DateRange {
    startDate: string;
    endDate: string;
}

export const dateRangeContext = createContext<[DateRange, (range: DateRange) => void]>([
    {startDate: '', endDate: ''},
    () => {},
]);
