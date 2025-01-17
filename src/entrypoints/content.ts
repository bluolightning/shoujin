export default defineContentScript({
    matches: ['<all_urls>'],
    main() {
        function grabDate() {
            console.log('Hello time.');

            let date = Date.now();
            console.log('Current date:', date);
        }

        let urlInfo: {
            href: string;
            hostname: string;
            pathname: string;
        };
        urlInfo = {
            href: window.location.href, // The full url
            hostname: window.location.hostname,
            pathname: window.location.pathname,
        };

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                console.log('Page unfocused');

                (async () => {
                    const response = await browser.runtime.sendMessage({
                        type: 'page-unfocused',
                        url: urlInfo.hostname,
                        fullurl: urlInfo.href,
                    });

                    console.log('logging response: ' + response);
                })();
            } else {
                console.log('Page focused');

                (async () => {
                    const response = await browser.runtime.sendMessage({
                        type: 'page-focused',
                        url: urlInfo.hostname,
                        fullurl: urlInfo.href,
                    });

                    console.log('logging response: ' + response);
                })();

                grabDate();
            }
        });
    },
});
