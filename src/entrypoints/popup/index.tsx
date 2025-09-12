import React from 'react';
import ReactDOM from 'react-dom/client';
import {MantineProvider} from '@mantine/core';
import Popup from './Popup.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <MantineProvider defaultColorScheme='auto'>
            <Popup />
        </MantineProvider>{' '}
    </React.StrictMode>
);
