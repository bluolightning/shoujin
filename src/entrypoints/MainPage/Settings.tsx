import React, {useState} from 'react';
import {
    Container,
    Title,
    Text,
    Card,
    Group,
    Stack,
    Switch,
    Select,
    NumberInput,
    Button,
    Badge,
    ThemeIcon,
    Accordion,
    ActionIcon,
    Tooltip,
    Paper,
    Alert,
    Center,
    Loader,
} from '@mantine/core';
import {
    IconSettings,
    IconDatabase,
    IconClock,
    IconShield,
    IconBell,
    IconPalette,
    IconInfoCircle,
    IconExternalLink,
    IconRefresh,
} from '@tabler/icons-react';
import DataSettings from '@/components/DataSettings';
import {SettingsStorage, AppSettings} from '@/utils/settingsStorage';

interface SettingsSectionProps {
    title: string;
    description?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    badge?: string;
}

function SettingsSection({title, description, icon, children, badge}: SettingsSectionProps) {
    return (
        <Card shadow='sm' padding='lg' radius='md' withBorder>
            <Group justify='space-between' mb='md'>
                <Group>
                    <ThemeIcon size='lg' variant='light' radius='md'>
                        {icon}
                    </ThemeIcon>
                    <div>
                        <Group gap='xs'>
                            <Text fw={600} size='lg'>
                                {title}
                            </Text>
                            {badge && (
                                <Badge size='sm' variant='light'>
                                    {badge}
                                </Badge>
                            )}
                        </Group>
                        {description && (
                            <Text size='sm' c='dimmed'>
                                {description}
                            </Text>
                        )}
                    </div>
                </Group>
            </Group>
            <Stack gap='md'>{children}</Stack>
        </Card>
    );
}

interface SettingItemProps {
    label: string;
    description?: string;
    children: React.ReactNode;
    disabled?: boolean;
}

function SettingItem({label, description, children, disabled = false}: SettingItemProps) {
    return (
        <Group justify='space-between' wrap='nowrap' style={{opacity: disabled ? 0.6 : 1}}>
            <div style={{flex: 1}}>
                <Text size='sm' fw={500}>
                    {label}
                </Text>
                {description && (
                    <Text size='xs' c='dimmed' mt={2}>
                        {description}
                    </Text>
                )}
            </div>
            <div>{children}</div>
        </Group>
    );
}

export default function Settings() {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async function loadSettings() {
            try {
                const loadedSettings = await SettingsStorage.getSettings();
                setSettings(loadedSettings);
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    // Helper to update a single setting
    const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        if (!settings) return;

        try {
            await SettingsStorage.saveSetting(key, value);
            setSettings((prev) => (prev ? {...prev, [key]: value} : null));
        } catch (error) {
            console.error(`Failed to save setting ${key}:`, error);
        }
    };

    if (isLoading || !settings) {
        return (
            <Container size='lg' py='xl'>
                <Text>Loading settings...</Text>
                <Center>
                    <Loader />
                </Center>
            </Container>
        );
    }

    return (
        <Container size='lg' py='xl'>
            <Stack gap='xl'>
                {/* Header */}
                <div>
                    <Group>
                        <ThemeIcon
                            size='xl'
                            variant='gradient'
                            gradient={{from: 'blue', to: 'violet'}}>
                            <IconSettings size='1.5rem' />
                        </ThemeIcon>
                        <div>
                            <Title order={1}>Settings</Title>
                            <Text c='dimmed'>Customize your Shoujin experience</Text>
                        </div>
                    </Group>
                </div>
                {/* Tracking Settings */}
                <SettingsSection
                    title='Tracking'
                    description='Configure how your browsing activity is monitored'
                    icon={<IconClock size='1.2rem' />}>
                    <SettingItem
                        label='Enable tracking'
                        description='Toggle to start or stop tracking your browsing activity'>
                        <Switch
                            checked={settings.trackingEnabled}
                            onChange={(event) =>
                                updateSetting('trackingEnabled', event.currentTarget.checked)
                            }
                            size='md'
                        />
                    </SettingItem>

                    <SettingItem
                        label='Idle timeout'
                        description='Stop tracking after this many seconds of inactivity'
                        disabled={!settings.trackingEnabled}>
                        <NumberInput
                            value={settings.idleTimeout}
                            onChange={(val) => updateSetting('idleTimeout', Number(val) || 15)}
                            min={5}
                            max={300}
                            suffix=' sec'
                            style={{width: 120}}
                            disabled={!settings.trackingEnabled}
                        />
                    </SettingItem>

                    <SettingItem
                        label='Minimum visit time'
                        description='Only count visits longer than this duration'
                        disabled={!settings.trackingEnabled}>
                        <NumberInput
                            value={settings.minimumVisitTime}
                            onChange={(val) => updateSetting('minimumVisitTime', Number(val) || 5)}
                            min={1}
                            max={60}
                            suffix=' sec'
                            style={{width: 120}}
                            disabled={!settings.trackingEnabled}
                        />
                    </SettingItem>

                    <SettingItem
                        label='Track in private/incognito mode'
                        description='Include browsing activity from private browsing sessions'
                        disabled={!settings.trackingEnabled}>
                        <Switch
                            checked={settings.trackInPrivate}
                            onChange={(event) =>
                                updateSetting('trackInPrivate', event.currentTarget.checked)
                            }
                            size='md'
                            disabled={!settings.trackingEnabled}
                        />
                    </SettingItem>
                </SettingsSection>
                {/* Privacy Settings */}
                <SettingsSection
                    title='Privacy'
                    description='Control what data is collected and stored'
                    icon={<IconShield size='1.2rem' />}
                    badge='Important'>
                    <SettingItem
                        label='Use external favicon services'
                        description={'Use third-party services to improve favicon reliability'}>
                        <Switch
                            checked={settings.useFaviconService}
                            onChange={(event) =>
                                updateSetting('useFaviconService', event.currentTarget.checked)
                            }
                            size='md'
                        />
                    </SettingItem>
                    {/*
                    <SettingItem
                        label='Data retention period'
                        description='Automatically delete data older than selected period'>
                        <Select
                            value={settings.retentionPeriod}
                            onChange={(val) => updateSetting('retentionPeriod', val || 'unlimited')}
                            data={[
                                {value: 'unlimited', label: 'Keep forever'},
                                {value: '1year', label: '1 year'},
                                {value: '6months', label: '6 months'},
                                {value: '3months', label: '3 months'},
                                {value: '1month', label: '1 month'},
                            ]}
                            style={{width: 150}}
                        />
                    </SettingItem>
                    */}
                </SettingsSection>

                {/* Notifications Settings */}
                {/*
                <SettingsSection
                    title='Notifications'
                    description='Manage alerts and reminders'
                    icon={<IconBell size='1.2rem' />}
                    badge='Coming Soon'>
                    <SettingItem
                        label='Daily usage reminders'
                        description='Get notified about your daily browsing patterns'
                        disabled={true}>
                        <Switch
                            checked={dailyReminders}
                            onChange={(event) => setDailyReminders(event.currentTarget.checked)}
                            size='md'
                            disabled={true}
                        />
                    </SettingItem>

                    <SettingItem
                        label='Focus break suggestions'
                        description='Receive periodic reminders to take breaks'
                        disabled={true}>
                        <Switch
                            checked={focusBreaks}
                            onChange={(event) => setFocusBreaks(event.currentTarget.checked)}
                            size='md'
                            disabled={true}
                        />
                    </SettingItem>

                    <SettingItem
                        label='Weekly activity reports'
                        description='Summary of your weekly browsing activity'
                        disabled={true}>
                        <Switch
                            checked={weeklyReports}
                            onChange={(event) => setWeeklyReports(event.currentTarget.checked)}
                            size='md'
                            disabled={true}
                        />
                    </SettingItem>
                </SettingsSection>
                */}

                {/* Display Settings */}
                <SettingsSection
                    title='Display'
                    description='Customize the appearance and formatting'
                    icon={<IconPalette size='1.2rem' />}>
                    <SettingItem
                        label='Date format'
                        description='How dates appear throughout the application'>
                        <Select
                            value={settings.dateFormat}
                            onChange={(val) => updateSetting('dateFormat', val || 'YYYY-MM-DD')}
                            data={[
                                {value: 'YYYY-MM-DD', label: '2025-08-30'},
                                {value: 'MM/DD/YYYY', label: '08/30/2025'},
                                {value: 'DD/MM/YYYY', label: '30/08/2025'},
                                {value: 'MMM DD, YYYY', label: 'Aug 30, 2025'},
                            ]}
                            style={{width: 150}}
                        />
                    </SettingItem>

                    <SettingItem label='Time format' description='12-hour or 24-hour time display'>
                        <Select
                            value={settings.timeFormat}
                            onChange={(val) => updateSetting('timeFormat', val || '24h')}
                            data={[
                                {value: '24h', label: '24-hour (15:30)'},
                                {value: '12h', label: '12-hour (3:30 PM)'},
                            ]}
                            style={{width: 150}}
                        />
                    </SettingItem>

                    <SettingItem
                        label='Chart color theme'
                        description='Color scheme for charts and graphs'>
                        <Select
                            value={settings.chartTheme}
                            onChange={(val) => updateSetting('chartTheme', val || 'auto')}
                            data={[
                                {value: 'auto', label: 'Auto (follows app theme)'},
                                {value: 'light', label: 'Light theme'},
                                {value: 'dark', label: 'Dark theme'},
                                {value: 'colorful', label: 'Colorful'},
                            ]}
                            style={{width: 200}}
                        />
                    </SettingItem>
                </SettingsSection>
                {/* Data Management */}
                <SettingsSection
                    title='Data Management'
                    description='Import, export, and manage your browsing data'
                    icon={<IconDatabase size='1.2rem' />}>
                    <Alert
                        icon={<IconInfoCircle size='1rem' />}
                        title='Data Management'
                        variant='light'>
                        Use these tools to backup, restore, or clear your browsing data. Always
                        create a backup before importing new data or clearing existing data.
                    </Alert>

                    <Group gap='md' mt='md'>
                        <DataSettings />
                    </Group>
                </SettingsSection>

                {/* Advanced Settings */}
                {/*
                <SettingsSection
                    title='Advanced'
                    description='Developer and advanced user options'
                    icon={<IconSettings size='1.2rem' />}
                    badge='Advanced'>
                    <Accordion variant='contained'>
                        <Accordion.Item value='debug'>
                            <Accordion.Control>Debug & Development</Accordion.Control>
                            <Accordion.Panel>
                                <Stack gap='md'>
                                    <SettingItem
                                        label='Debug mode'
                                        description='Enable verbose logging for troubleshooting'
                                        disabled={true}>
                                        <Switch size='md' disabled={true} />
                                    </SettingItem>

                                    <SettingItem
                                        label='Console logging'
                                        description='Output detailed logs to browser console'
                                        disabled={true}>
                                        <Switch size='md' disabled={true} />
                                    </SettingItem>

                                    <Group gap='md'>
                                        <Button
                                            variant='light'
                                            leftSection={<IconRefresh size='1rem' />}
                                            disabled={true}>
                                            Reset Extension
                                        </Button>
                                        <Button
                                            variant='light'
                                            leftSection={<IconExternalLink size='1rem' />}
                                            disabled={true}>
                                            View Logs
                                        </Button>
                                    </Group>
                                </Stack>
                            </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value='experimental'>
                            <Accordion.Control>Experimental Features</Accordion.Control>
                            <Accordion.Panel>
                                <Alert
                                    icon={<IconInfoCircle size='1rem' />}
                                    title='Experimental'
                                    color='orange'>
                                    These features are in development and may not work as expected.
                                </Alert>

                                <Stack gap='md' mt='md'>
                                    <SettingItem
                                        label='Enhanced analytics'
                                        description='More detailed usage patterns and insights'
                                        disabled={true}>
                                        <Switch size='md' disabled={true} />
                                    </SettingItem>

                                    <SettingItem
                                        label='AI-powered insights'
                                        description='Smart recommendations based on your usage'
                                        disabled={true}>
                                        <Switch size='md' disabled={true} />
                                    </SettingItem>
                                </Stack>
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                </SettingsSection>
                */}

                {/* Footer */}
                <Paper p='md' radius='md' bg='var(--mantine-color-gray-0)'>
                    <Group justify='space-between'>
                        <div>
                            <Text size='sm' fw={500}>
                                Shoujin v0.0.1
                            </Text>
                            <Text size='xs' c='dimmed'>
                                Web Extension for Time Tracking
                            </Text>
                        </div>
                        <Group gap='xs'>
                            <Tooltip label='Documentation'>
                                <ActionIcon variant='subtle' disabled={true}>
                                    <IconInfoCircle size='1rem' />
                                </ActionIcon>
                            </Tooltip>
                            <Tooltip label='GitHub Repository'>
                                <ActionIcon variant='subtle' disabled={true}>
                                    <IconExternalLink size='1rem' />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Group>
                </Paper>
            </Stack>
        </Container>
    );
}
