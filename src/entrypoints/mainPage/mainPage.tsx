import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Page from './sidebar';
import App from './App';
import '@/output.css';

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <Page />,
        },
        {
            path: '/profile',
            element: <App />,
        },
        {
            path: '/mainPage.html',
            element: <Page />,
        },
    ],
    {
        basename: '/',
    }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
