interface MessageResponse {
    status: string;
}

export default defineContentScript({
    matches: ['<all_urls>'],
    main() {
        let startTime: Date;
        let endTime: Date;
        let sessionStatus: boolean = false;

        const urlInfo = {
            href: window.location.href,
            hostname: window.location.hostname,
            pathname: window.location.pathname,
        };

        // Send a message to the background script when the page is focused or unfocused
        const sendMessage = async (
            type: 'page-focused' | 'page-unfocused' | 'detect-idle',
            time?: number | null | undefined
        ): Promise<string> => {
            const response: MessageResponse = await browser.runtime.sendMessage(
                {
                    type,
                    time,
                    url: urlInfo.hostname,
                    fullurl: urlInfo.href,
                }
            );

            console.log('logging response:', response.status);
            return response.status;
        };

        function endSession() {
            if (!sessionStatus) {
                throw new Error('Session already ended');
            }
            endTime = new Date();
            const timeOnPage = (+endTime - +startTime) / 1000;
            const roundedTime = Math.round(timeOnPage * 1000) / 1000;
            console.log(roundedTime);

            sessionStatus = false;
            sendMessage('page-unfocused', roundedTime);
        }

        function startSession() {
            if (sessionStatus) {
                throw new Error('Session already in progress');
            }
            sessionStatus = true;
            startTime = new Date();
            sendMessage('page-focused', null);
        }

        startSession();

        // Listen for page visibility changes
        document.addEventListener('visibilitychange', function () {
            resetIdleTimer();
            if (document.hidden && sessionStatus) {
                endSession();
            }
        });

        const idleTimeoutLimit = 10 * 1000;
        let idleTimer: ReturnType<typeof setTimeout> | null = null;
        // Fires when the page has gone idle
        function handlePageIdle() {
            console.log(
                `The user is now idle at ${idleTimeoutLimit} milliseconds, ending session.`
            );
            if (sessionStatus) {
                endSession();
            }
        }

        // Fires when there is user activity
        function resetIdleTimer() {
            if (idleTimer !== null) {
                clearTimeout(idleTimer);
            }
            if (!document.hidden) {
                idleTimer = setTimeout(handlePageIdle, idleTimeoutLimit);
            }
            if (!sessionStatus) {
                startSession();
            }
            console.log('User activity detected, resetting idle timer.');
        }

        // List of events to listen for user activity
        const activityEvents = [
            'mousemove',
            'mousedown',
            'keydown',
            'scroll',
            'touchstart',
            'wheel',
        ];
        activityEvents.forEach((eventName) => {
            document.addEventListener(eventName, resetIdleTimer, true);
        });
        console.log('Page Idle Detector script loaded and listening.');

        /*
        function removeActivityListeners() {
            activityEvents.forEach((eventName) => {
                document.removeEventListener(eventName, resetIdleTimer, true);
            });
            document.removeEventListener(
                'visibilitychange',
                resetIdleTimer,
                true
            );
            if (idleTimer !== null) {
                clearTimeout(idleTimer);
            }
        }
        */
    },
});
