'use client';
import React from 'react';
import {AppShell, MantineProvider} from '@mantine/core';
import {AppSidebar} from '../../components/AppSidebar';
import {Outlet} from 'react-router';

export default function Page() {
    return (
        <MantineProvider defaultColorScheme='dark'>
            <AppShell navbar={{width: 300, breakpoint: 'sm'}} padding='md'>
                <AppShell.Navbar>
                    <AppSidebar />
                </AppShell.Navbar>

                <AppShell.Main>
                    <Outlet />
                </AppShell.Main>
            </AppShell>
        </MantineProvider>
    );
}
