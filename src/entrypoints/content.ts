interface MessageResponse {
    status: string;
}

export default defineContentScript({
    matches: ['<all_urls>'],
    main() {
        let startTime: Date;
        let endTime: Date;
        let sessionStatus: boolean = false; // Initialize sessionStatus to false

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
            if (document.hidden && sessionStatus) {
                endSession();
            } else {
                if (!sessionStatus) startSession();
            }
        });

        /*
        // Detect idle state - checks computer activity
        let count = 0;
        const intervalId = setInterval(async () => {
            console.log('detecting idle...');
            const message = await sendMessage('detect-idle', null);

            if (message === 'active') {
                console.log('active');
                if (!sessionStatus) {
                    startSession();
                }
            } else if (message === 'idle' || message === 'locked') {
                console.log('idle or locked');
                if (sessionStatus) {
                    endSession();
                }
            } else {
                console.log('invalid idle state');
            }

            count++;
            if (count === 240) {
                // 240 * 15s = 1 hour; the interval will then be cleared
                clearInterval(intervalId);
                console.log('interval cleared');
            }
        }, 15000); 
        */

        //ss

        const idleTimeoutLimit = 10 * 1000;
        let idleTimer: ReturnType<typeof setTimeout> | null = null;
        // Fires when the page has gone idle
        function handlePageIdle() {
            console.log(
                `The user is now idle at ${idleTimeoutLimit} milliseconds, ending session.`
            );
            // endSession();
        }

        // Fires when there is user activity
        function resetIdleTimer() {
            if (idleTimer !== null) {
                clearTimeout(idleTimer);
            }
            if (!document.hidden) {
                idleTimer = setTimeout(handlePageIdle, idleTimeoutLimit);
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

        function addActivityListeners() {
            activityEvents.forEach((eventName) => {
                document.addEventListener(eventName, resetIdleTimer, true);
            });
            document.addEventListener('visibilitychange', resetIdleTimer, true);
        }

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

        /* Unnecessary? - probably fine to delete
        if (!document.hidden) {
            resetIdleTimer();
        } */

        addActivityListeners();
        console.log('Page Idle Detector script loaded and listening.');
    },
});
