import { StorageManager } from '@/modules/storage';
import getFavicon from '@/utils/getFavicon';

export default defineBackground(() => {
    let favicon: string | undefined;
    browser.runtime.onMessage.addListener((message, _, sendResponse) => {
        console.log('Message from:', message);

        if (message.type === 'page-focused') {
            sendResponse({ status: 'Page focused received' });
            getFavicon().then((result) => {
                favicon = result;
            });
        } else if (message.type === 'page-unfocused') {
            StorageManager.savePageTime(message.url, message.time, favicon);
            sendResponse({ status: 'Page unfocused received' });
            console.log('Time spent on page:', message.time, message.url);

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
