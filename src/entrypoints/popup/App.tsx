import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);
    const [favicon, setFavicon] = useState<string | null>(null);

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
                if (tabs[0].favIconUrl) {
                    setFavicon(tabs[0].favIconUrl);
                }
            } catch (err: unknown) {
                console.error('Error getting tab URL:', err);
            }
        };

        getCurrentTabUrl();
    }, []);

    const openNewTab = () => {
        chrome.tabs.create({
            url: chrome.runtime.getURL('mainPage.html'),
        });
    };

    return (
        <>
            <h2>{currentUrl}</h2>
            <p>{favicon && <img src={favicon} alt="favicon" />}</p>
            <button onClick={openNewTab}>Open Extension Page</button>
        </>
    );
}

export default App;
