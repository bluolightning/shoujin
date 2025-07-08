import dayjs from 'dayjs';
import {DatePicker} from '@mantine/dates';

export default function DateSelector() {
    const today = dayjs();

    return (
        <DatePicker
            type='range'
            allowSingleDateInRange
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
            defaultValue={[today.format('YYYY-MM-DD'), today.format('YYYY-MM-DD')]}
        />
    );
}
