export default defineBackground(() => {
    async function getCurrentTabUrl() {
        try {
            const tabs = await browser.tabs.query({
                active: true,
                currentWindow: true,
            });
            if (tabs && tabs[0] && tabs[0].url) {
                return tabs[0].url;
            }
        } catch (err) {
            console.error('Error getting tab URL:', err);
        }
    }

    (async () => {
        let url = await getCurrentTabUrl();

        while (!url) {
            setInterval(() => {}, 1000);
            url = await getCurrentTabUrl();
        }

        console.log('Current tab URL:', url);
    })();

    browser.runtime.onMessage.addListener((message, _, sendResponse) => {
        console.log('Message from:', message);

        if (message.type === 'page-focused') {
            sendResponse({ status: 'Page focused received' });
        } else if (message.type === 'page-unfocused') {

            console.log('Time spent on page:', message.time);
            sendResponse({ status: 'Page unfocused received' });
        } else {
            sendResponse({ status: 'Unknown message type' });
        }

        return true;
    });
});
