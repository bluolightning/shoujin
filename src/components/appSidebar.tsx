import React from 'react';
import { useState } from 'react';
import {
    Icon2fa,
    IconBellRinging,
    IconDatabaseImport,
    IconFingerprint,
    IconKey,
    IconLogout,
    IconReceipt2,
    IconSettings,
    IconSwitchHorizontal,
} from '@tabler/icons-react';
import { Code, Group } from '@mantine/core';
import classes from './appSidebar.module.css';
import { Link } from 'react-router';

const data = [
    { link: 'Dashboard', label: 'Dashboard', icon: IconBellRinging },
    { link: 'Dopcan', label: 'Other Settings', icon: IconSettings },
    { link: 'DataSettings', label: 'Data Settings', icon: IconDatabaseImport },
    { link: '', label: 'Security', icon: IconFingerprint },
    { link: '', label: 'SSH Keys', icon: IconKey },
    { link: '', label: 'Billing', icon: IconReceipt2 },
    { link: '', label: 'Authentication', icon: Icon2fa },
];

export function AppSidebar() {
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
                <Group className={classes.header} justify="space-between">
                    <div>
                        <img src="clock-img.jpeg" alt="Logo" />
                    </div>
                    <Code fw={700}>v3.1.2</Code>
                </Group>
                {links}
            </div>

            <div className={classes.footer}>
                <a
                    href="#"
                    className={classes.link}
                    onClick={(event) => event.preventDefault()}>
                    <IconSwitchHorizontal
                        className={classes.linkIcon}
                        stroke={1.5}
                    />
                    <span>Change account</span>
                </a>

                <a
                    href="#"
                    className={classes.link}
                    onClick={(event) => event.preventDefault()}>
                    <IconLogout className={classes.linkIcon} stroke={1.5} />
                    <span>Logout</span>
                </a>
            </div>
        </nav>
    );
}
