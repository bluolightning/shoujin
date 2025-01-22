import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import './App.css';
import '../../output.css';

function App() {
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);

    useEffect(() => {
        const getCurrentTabUrl = async () => {
            try {
                const tabs = await chrome.tabs.query({
                    active: true,
                    currentWindow: true,
                });
                if (tabs && tabs[0] && tabs[0].url) {
                    setCurrentUrl(tabs[0].url);
                }
            } catch (err: unknown) {
                console.error('Error getting tab URL:', err);
            }
        };

        getCurrentTabUrl();
    }, []);

    return (
        <>
            <p className="text-3xl font-bold underline">hi</p>
            <h2>{currentUrl}</h2>
            <Button variant="default">Click me</Button>
        </>
    );
}

export default App;
