import React, { useState, useEffect } from 'react';
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

    const openNewTab = () => {
        chrome.tabs.create({
            url: chrome.runtime.getURL('thepage.html'),
        });
    };

    return (
        <>
            <p className="text-3xl font-bold underline">hi</p>
            <h2>{currentUrl}</h2>
            <button onClick={openNewTab}>Open Page in New Tab</button>
        </>
    );
}

export default App;
