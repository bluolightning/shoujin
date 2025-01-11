export default defineContentScript({
    matches: ['*://*.google.com/*'],
    main() {
        // content.ts

        // Function to send a message to the background script
        function sendMessage(message: any) {
            chrome.runtime.sendMessage(message);
        }

        // Function to track page visibility changes
        function trackPageVisibility() {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    sendMessage({
                        action: 'pageVisible',
                        url: window.location.href,
                    });
                    console.log('Page became visible');
                } else {
                    sendMessage({
                        action: 'pageHidden',
                        url: window.location.href,
                    });
                    console.log('Page became hidden');
                }
            });

            // Send initial visibility state on load
            sendMessage({
                action:
                    document.visibilityState === 'visible'
                        ? 'pageVisible'
                        : 'pageHidden',
                url: window.location.href,
            });
        }

        // Function to track focus/blur events (more comprehensive than visibilitychange)
        function trackFocusBlur() {
            window.addEventListener('focus', () => {
                sendMessage({
                    action: 'pageFocused',
                    url: window.location.href,
                });
                console.log('Page focused');
            });

            window.addEventListener('blur', () => {
                sendMessage({
                    action: 'pageBlurred',
                    url: window.location.href,
                });
                console.log('Page blurred');
            });

            // Send initial focus state on load (important for cases where the tab is already focused on load)
            if (document.hasFocus()) {
                sendMessage({
                    action: 'pageFocused',
                    url: window.location.href,
                });
            } else {
                sendMessage({
                    action: 'pageBlurred',
                    url: window.location.href,
                }); // Account for initial unfocused state
            }
        }


  

        // Choose which tracking method(s) to use. Focus/blur is generally more reliable.
        // trackPageVisibility(); // Less reliable, especially across different windows/tabs
        trackFocusBlur(); // More reliable for tracking user interaction with the page itself

        console.log('Content script loaded.');
    },
});
