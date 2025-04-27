import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Page from './sidebar';
import Dashboard from './Dashboard';
import Dopcan from './Dopcan';
import DataSettings from './DataSettings';
import Default from './Default';
import '@/output.css';

const router = createBrowserRouter([
    {
        path: 'mainPage.html',
        element: <Page />,
        children: [
            {
                index: true,
                element: <Default />,
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
        <RouterProvider router={router} />
    </React.StrictMode>
);
