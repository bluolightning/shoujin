import React from 'react';
import ReactDOM from 'react-dom/client';
import Page from './sidebar';
import '@/output.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Page />
    </React.StrictMode>
);
