import {useState, useEffect} from 'react';
import './Popup.css';

export default function Popup() {
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);

    useEffect(() => {
        const getCurrentTabUrl = async () => {
            try {
                const tabs = await browser.tabs.query({
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
        browser.tabs.create({
            url: browser.runtime.getURL('/MainPage.html'),
        });
    };

    return (
        <>
            <h2>{currentUrl}</h2>
            <button onClick={openNewTab}>Open Extension Page</button>
        </>
    );
}
