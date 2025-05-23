import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Page from './sidebar';
import Dashboard from './Dashboard';
import Dopcan from './Dopcan';
import DataSettings from './DataSettings';
import '@/output.css';

import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';

const theme = createTheme({
    /** Put your mantine theme override here */
});

const router = createBrowserRouter([
    {
        path: 'mainPage.html',
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
                path: 'Dopcan',
                element: <Dopcan />,
            },
            {
                path: 'DataSettings',
                element: <DataSettings />,
            },
        ],
    },
]);
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <MantineProvider theme={theme} defaultColorScheme="auto">
            <ModalsProvider>
                <RouterProvider router={router} />
            </ModalsProvider>
        </MantineProvider>{' '}
    </React.StrictMode>
);
