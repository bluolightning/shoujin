import { StorageManager } from '@/modules/storage';

export default defineBackground(() => {
    browser.runtime.onMessage.addListener((message, _, sendResponse) => {
        console.log('Message from:', message);

        if (message.type === 'page-focused') {
            sendResponse({ status: 'Page focused received' });
        } else if (message.type === 'page-unfocused') {
            StorageManager.savePageTime(message.url, message.time);
            console.log('Time spent on page:', message.time, message.url);
            sendResponse({ status: 'Page unfocused received' });

            setTimeout(() => {
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
