import {useState} from 'react';
import {IconBellRinging, IconClockCog, IconSettings, IconFlag} from '@tabler/icons-react';
// import {IconShieldLock} from '@tabler/icons-react';
import {Code, Group, Text, Tooltip, SimpleGrid} from '@mantine/core';
import classes from './AppSidebar.module.css';
import {Link} from 'react-router';
import ThemeToggle from './ThemeToggle';
import GitHubIcon from '@/components/MantineComponents/GitHubIcon';
//import LogoImage from '/assets/icons/128.png';

const data = [
    {link: 'Dashboard', label: 'Dashboard', icon: IconBellRinging},
    {link: 'Pomodoro', label: 'Pomodoro', icon: IconFlag},
    {link: 'SiteLimits', label: 'Site Limits', icon: IconClockCog},
    {link: 'Settings', label: 'Settings', icon: IconSettings},
];

export default function AppSidebar() {
    const [active, setActive] = useState('Dashboard');

    const links = data.map((item) => (
        <Link
            className={classes.link}
            data-active={item.label === active || undefined}
            to={item.link}
            key={item.label}
            onClick={() => {
                setActive(item.label);
            }}>
            <item.icon className={classes.linkIcon} stroke={1.5} />
            <span>{item.label}</span>
        </Link>
    ));

    return (
        <nav className={classes.navbar}>
            <div className={classes.navbarMain}>
                <Group className={classes.header} justify='space-between'>
                    <div>
                        {/* <img src={LogoImage} alt="Logo" width="32px" /> */}
                        <Text
                            size='lg'
                            fw={700}
                            variant='gradient'
                            gradient={{from: 'blue', to: 'violet', deg: 90}}>
                            shoujin
                        </Text>
                    </div>
                    <Code fw={700}>v1.1.1</Code>
                </Group>
                {links}
            </div>

            <div className={classes.footer}>
                <SimpleGrid cols={5} spacing='xs' style={{width: '100%'}}>
                    <Tooltip label='Toggle theme'>
                        <div>
                            <ThemeToggle />
                        </div>
                    </Tooltip>
                    <Tooltip label='Source code'>
                        <div>
                            <GitHubIcon />
                        </div>
                    </Tooltip>
                </SimpleGrid>
            </div>
        </nav>
    );
}
