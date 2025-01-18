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
            type: 'page-focused' | 'page-unfocused'
        ): Promise<void> => {
            try {
                const response: MessageResponse =
                    await browser.runtime.sendMessage({
                        type,
                        url: urlInfo.hostname,
                        fullurl: urlInfo.href,
                    });
                console.log('logging response:', response.status);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        };

        // Listen for page visibility changes
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                console.log('Page unfocused');

                endTime = new Date();

                const timeOnPage = (+endTime - +startTime) / 1000;
                console.log(timeOnPage);

                sendMessage('page-unfocused');
            } else {
                console.log('Page focused');

                startTime = new Date();
                sendMessage('page-focused');
            }
        });
    },
});
