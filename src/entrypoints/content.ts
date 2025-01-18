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

        // Send message to background script when page is focused or unfocused
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                console.log('Page unfocused');
                endTime = new Date();

                const timeOnPage = (+endTime - +startTime) / 1000;
                console.log(timeOnPage);

                (async () => {
                    const response = await browser.runtime.sendMessage({
                        type: 'page-unfocused',
                        url: urlInfo.hostname,
                        fullurl: urlInfo.href,
                    });
                    console.log('logging response: ' + response.status);
                })();
            } else {
                console.log('Page focused');
                startTime = new Date();

                (async () => {
                    const response = await browser.runtime.sendMessage({
                        type: 'page-focused',
                        url: urlInfo.hostname,
                        fullurl: urlInfo.href,
                    });
                    console.log('logging response: ' + response.status);
                })();
            }
        });
    },
});
