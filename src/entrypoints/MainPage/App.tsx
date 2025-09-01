import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router';
import Dashboard from './Dashboard';
import Settings from './Settings';
import SiteLimits from './SiteLimits';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';

import {createTheme, MantineProvider} from '@mantine/core';
import {ModalsProvider} from '@mantine/modals';
import {Notifications} from '@mantine/notifications';

import Page from './Page.tsx';

const theme = createTheme({
    /** Put your mantine theme override here */
});

const router = createBrowserRouter([
    {
        path: 'MainPage.html',
        element: <Page />,
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
            {
                path: 'Dashboard',
                element: <Dashboard />,
            },
            {
                path: 'SiteLimits',
                element: <SiteLimits />,
            },
            {
                path: 'Settings',
                element: <Settings />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <MantineProvider theme={theme} defaultColorScheme='auto'>
            <ModalsProvider>
                <Notifications />
                <RouterProvider router={router} />
            </ModalsProvider>
        </MantineProvider>{' '}
    </React.StrictMode>
);
