import dayjs from 'dayjs';
import {DatePickerInput} from '@mantine/dates';
import {useContext, useEffect, useState} from 'react';
import {dateRangeContext} from '@/utils/dateRangeContext';
import {SettingsStorage} from '@/utils/settingsStorage';
import {StorageManager} from '@/utils/storage';

export default function DateSelector() {
    const today = dayjs();

    const [dateRange, setDateRange] = useContext(dateRangeContext);

    const [value, setValue] = useState<[string | null, string | null]>([
        dateRange.startDate,
        dateRange.endDate,
    ]);

    const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
    useEffect(() => {
        SettingsStorage.getSettings().then((s) => {
            setDateFormat(s.dateFormat || 'YYYY-MM-DD');
        });
    }, []);

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

    /*
    async function calcMaxDateRange() {
        const data = await StorageManager.getAllStoredData();
        if (data.length > 0) {
            const allDates: string[] = [];
            for (const entry of data) {
                if (entry.dateData) {
                    allDates.push(...Object.keys(entry.dateData));
                }
            }

            if (allDates.length > 0) {
                allDates.sort();
                const minDate = allDates[0];
                const maxDate = allDates[allDates.length - 1];
                return [minDate, maxDate];
            }
        } else {
            return [today, today]; // Default to today if no data
        }
    }
    */

    return (
        <DatePickerInput
            type='range'
            allowSingleDateInRange
            highlightToday
            presets={[
                {
                    value: [today.format('YYYY-MM-DD'), today.format('YYYY-MM-DD')],
                    label: 'Today',
                },
                {
                    value: [
                        today.subtract(3, 'day').format('YYYY-MM-DD'),
                        today.format('YYYY-MM-DD'),
                    ],
                    label: 'Last 3 days',
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
                        today.subtract(30, 'day').format('YYYY-MM-DD'),
                        today.format('YYYY-MM-DD'),
                    ],
                    label: 'Last 30 days',
                },
                {
                    value: [
                        today.startOf('month').format('YYYY-MM-DD'),
                        today.format('YYYY-MM-DD'),
                    ],
                    label: 'This month',
                },

                {
                    value: [today.startOf('year').format('YYYY-MM-DD'), today.format('YYYY-MM-DD')],
                    label: 'This year',
                },
            ]}
            value={value}
            onChange={handleDateChange}
            onDropdownClose={handleDropdownClose}
            valueFormat={dateFormat}
        />
    );
}
