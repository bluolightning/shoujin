import { StorageManager } from '@/modules/storage';
import getFavicon from '@/utils/getFavicon';

export default defineBackground(() => {
    browser.runtime.onMessage.addListener((message, _, sendResponse) => {
        console.log('Message from:', message);

        if (message.type === 'page-focused') {
            sendResponse({ status: 'Page focused received' });
        } else if (message.type === 'page-unfocused') {
            (async function () {
                const favicon: string | undefined = await getFavicon();
                StorageManager.savePageTime(message.url, message.time, favicon);
                console.log('Time spent on page:', message.time, message.url);
                sendResponse({ status: 'Page unfocused received' });
            })();

            setTimeout(() => {
                //testing only
                StorageManager.getAllStoredData().then((data) => {
                    console.log('Stored data:', data);
                });
            }, 3000);
        } else {
            sendResponse({ status: 'Unknown message type' });
        }

        return true;
    });
});
