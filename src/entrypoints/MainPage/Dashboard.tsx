import {useState, useEffect} from 'react';
import {Grid, Group, Loader, Center} from '@mantine/core';

import SiteUsageList from '@/components/SiteUsageList';
import PieChartDonut from '@/components/PieChartDonut';
import DateSelector from '@/components/DateSelector';
import MainChart from '@/components/MainChart';

import dayjs from 'dayjs';
import {dateRangeContext} from '@/utils/dateRangeContext';
import {StorageManager, type PageTimeEntry} from '@/utils/storage';
import filterDataByDate from '@/utils/filterDataByDate';

export default function Dashboard() {
    const [dateRange, setDateRange] = useState({
        startDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
    });

    const [allData, setAllData] = useState<PageTimeEntry[]>([]);
    const [filteredData, setFilteredData] = useState<PageTimeEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // Initialize all data from storage
    useEffect(() => {
        (async () => {
            try {
                const data = await StorageManager.getAllStoredData();
                setAllData(data);
            } catch (error) {
                console.error('Failed to fetch data from storage:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Refilter data whenever dateRange or allData changes
    useEffect(() => {
        if (allData.length > 0) {
            const data = filterDataByDate(allData, dateRange.startDate, dateRange.endDate);
            setFilteredData(data);
        }
    }, [dateRange, allData]);

    if (loading) {
        return (
            <Center style={{height: '100%'}}>
                <Loader />
            </Center>
        );
    }

    return (
        <dateRangeContext.Provider value={[dateRange, setDateRange]}>
            <Group
                justify='right'
                style={{
                    height: '46px', // Match the height of the sidebar header
                    paddingBottom: 'var(--mantine-spacing-md)',
                    marginBottom: 'calc(var(--mantine-spacing-md) * 1.5)',
                    borderBottom:
                        '1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))',
                }}>
                <div>
                    <DateSelector />
                </div>
            </Group>

            {/* Allow dateRange to be passed to children */}
            <Grid gutter='md'>
                <Grid.Col span={{base: 12, md: 5, lg: 4}}>
                    <div>
                        <MainChart data={filteredData} />
                    </div>
                </Grid.Col>
                <Grid.Col span={{base: 12, md: 5, lg: 4}}>
                    <div>
                        <PieChartDonut data={filteredData} />
                    </div>
                </Grid.Col>
                <Grid.Col span={{base: 12, md: 7, lg: 8}}>
                    <SiteUsageList data={filteredData} />
                </Grid.Col>
            </Grid>
        </dateRangeContext.Provider>
    );
}
