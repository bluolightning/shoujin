import dayjs from 'dayjs';
import {DatePickerInput} from '@mantine/dates';
import {useContext, useState} from 'react';
import {dateRangeContext} from '@/utils/dateRangeContext';

export default function DateSelector() {
    const today = dayjs();

    const [dateRange, setDateRange] = useContext(dateRangeContext);

    const [value, setValue] = useState<[string | null, string | null]>([
        dateRange.startDate,
        dateRange.endDate,
    ]);

    const handleDateChange = (dates: [string | null, string | null]) => {
        setValue(dates);

        if (dates[0] && dates[1]) {
            setDateRange({
                startDate: dayjs(dates[0]).format('YYYY-MM-DD'),
                endDate: dayjs(dates[1]).format('YYYY-MM-DD'),
            });
        }
    };

    // Prevent the date range from having invalid values
    const handleDropdownClose = () => {
        if (!value[0] || !value[1]) {
            setValue([dateRange.startDate, dateRange.endDate]);
        }
    };

    return (
        <DatePickerInput
            type='range'
            allowSingleDateInRange
            highlightToday
            presets={[
                {
                    value: [
                        today.subtract(2, 'day').format('YYYY-MM-DD'),
                        today.format('YYYY-MM-DD'),
                    ],
                    label: 'Last two days',
                },
                {
                    value: [
                        today.subtract(7, 'day').format('YYYY-MM-DD'),
                        today.format('YYYY-MM-DD'),
                    ],
                    label: 'Last 7 days',
                },
                {
                    value: [
                        today.startOf('month').format('YYYY-MM-DD'),
                        today.format('YYYY-MM-DD'),
                    ],
                    label: 'This month',
                },
                {
                    value: [
                        today.subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
                        today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
                    ],
                    label: 'Last month',
                },
                {
                    value: [
                        today.subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),
                        today.subtract(1, 'year').endOf('year').format('YYYY-MM-DD'),
                    ],
                    label: 'Last year',
                },
            ]}
            value={value}
            onChange={handleDateChange}
            onDropdownClose={handleDropdownClose}
        />
    );
}
