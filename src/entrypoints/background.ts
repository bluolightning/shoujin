import {StorageManager} from '@/modules/storage';
import getFavicon from '@/utils/getFavicon';
import formatUrl from '@/utils/formatUrl';

export default defineBackground(() => {
    const tabFavicons = new Map<number, string>();

    browser.runtime.onMessage.addListener((message, _, sendResponse) => {
        console.log('New Message:', message);
        const tabId = message.tabId;

        if (message.type === 'page-focused') {
            getFavicon(message.url).then((result) => {
                if (tabId && result) {
                    tabFavicons.set(tabId, result);
                    console.log('Favicon found for tab', tabId, ':', result);
                }
            });
            sendResponse({status: `Page focused received`});
        } else if (message.type === 'page-unfocused') {
            const formattedUrl = formatUrl(message.url);
            const favicon = tabId ? tabFavicons.get(tabId) : undefined;

            StorageManager.savePageTime(formattedUrl, message.time, favicon, message.firstVisit);

            // Remove the favicon from storage for the unfocused tab
            if (tabId) {
                tabFavicons.delete(tabId);
            }

            sendResponse({status: 'Page unfocused received'});
            console.log('Time spent on page:', message.time, formattedUrl);
        } else {
            sendResponse({status: 'Unknown message type'});
        }

        return true;
    });

    // Clean up favicon storage when tabs are closed
    browser.tabs.onRemoved.addListener((tabId) => {
        tabFavicons.delete(tabId);
    });
});
