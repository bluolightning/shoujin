export default defineContentScript({
    matches: ['<all_urls>'],
    allFrames: true,
    main() {
        let lastActivityTime = 0; // Initialize to 0 to ensure the initial activity check
        const activityThrottleTime = 2000; // Throttle time in milliseconds

        // Notify the background script about user activity
        const notifyBackground = () => {
            const now = Date.now();

            // Throttle activity messages to avoid spam
            if (now - lastActivityTime > activityThrottleTime) {
                browser.runtime.sendMessage({type: 'user-activity'});
                lastActivityTime = now;
            }
        };

        // List of events to listen for user activity
        const activityEvents = [
            'mousemove',
            'mousedown',
            'keydown',
            'scroll',
            'touchstart',
            'wheel',
            'click',
            'focus',
        ];

        activityEvents.forEach((eventName) => {
            document.addEventListener(eventName, notifyBackground, {capture: true, passive: true});
        });

        if (window.self !== window.top) {
            activityEvents.forEach((eventName) => {
                document.addEventListener(
                    eventName,
                    () => {
                        // The message to the parent is also a form of activity
                        window.parent.postMessage({type: 'iframe-activity'}, '*');
                    },
                    {capture: true, passive: true}
                );
            });
        } else {
            // The top-level frame listens for activity from its iframes
            window.addEventListener('message', (event) => {
                if (event.data?.type === 'iframe-activity') {
                    notifyBackground();
                }
            });
        }

        console.log('Content script loaded and activity listeners set up.');

        if (document.visibilityState === 'visible' && document.hasFocus()) {
            console.log('Initial page focus detected');
            notifyBackground();
        }

        /*
        function checkVidStatus() {
            const videos = document.querySelectorAll('video');
            for (const video of videos) {
                if (!video.paused && !video.ended && video.readyState > 2) {
                    return true;
                }
            }
            return false;
        }
        */
    },
});
