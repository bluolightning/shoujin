interface MessageResponse {
    status: string;
}

export default defineContentScript({
    matches: ['<all_urls>'],
    main() {
        let startTime = new Date();
        let endTime: Date;

        const urlInfo = {
            href: window.location.href,
            hostname: window.location.hostname,
            pathname: window.location.pathname,
        };

        // Send a message to the background script
        const sendMessage = async (
            type: 'page-focused' | 'page-unfocused',
            time?: number | null | undefined
        ): Promise<void> => {
                const response: MessageResponse =
                    await browser.runtime.sendMessage({
                        type,
                        time,
                        url: urlInfo.hostname,
                        fullurl: urlInfo.href,
                    });
                
                console.log('logging response:', response.status);
        };

        // Listen for page visibility changes
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                endTime = new Date();

                const timeOnPage = (+endTime - +startTime) / 1000;
                console.log(timeOnPage);

                sendMessage('page-unfocused', timeOnPage);
            } else {
                startTime = new Date();
                sendMessage('page-focused', null);
            }
        });
    },
});
