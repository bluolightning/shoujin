import dayjs from 'dayjs';
import {DatePicker} from '@mantine/dates';
import {useContext} from 'react';
import {dateRangeContext} from '@/utils/dateRangeContext';

export default function DateSelector() {
    const today = dayjs();

    const [dateRange, setDateRange] = useContext(dateRangeContext);
    const handleDateChange = (dates: Array<string | null>) => {
        if (dates && dates[0] && dates[1]) {
            const [start, end] = dates;

            // Call the setter function from the context to update the state in Dashboard
            setDateRange({
                startDate: dayjs(start).format('YYYY-MM-DD'),
                endDate: dayjs(end).format('YYYY-MM-DD'),
            });
        }
    };

    return (
        <>
            <h3>
                Selected Date Range: {dateRange.startDate} - {dateRange.endDate}
            </h3>
            <DatePicker
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
                defaultValue={[dateRange.startDate, dateRange.endDate]}
                onChange={handleDateChange}
            />
        </>
    );
}
