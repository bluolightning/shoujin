interface MessageResponse {
    status: string;
}

export default defineContentScript({
    matches: ['<all_urls>'],
    main() {
        let startTime: Date;
        let endTime: Date;
        let sessionStatus: boolean = false;

        // Send a message to the background script when the page is focused or unfocused
        const sendMessage = async (
            type: 'page-focused' | 'page-unfocused' | 'detect-idle',
            time?: number | null | undefined
        ): Promise<string> => {
            const response: MessageResponse = await browser.runtime.sendMessage(
                {
                    type,
                    time,
                    url: window.location.hostname,
                    fullurl: window.location.href,
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

        // Listen for page visibility changes
        document.addEventListener('visibilitychange', function () {
            resetIdleTimer();
            if (document.hidden && sessionStatus) {
                if (idleTimer !== null) {
                    clearTimeout(idleTimer);
                }
                endSession();
            } else if (!document.hidden && !sessionStatus) {
                startSession();
                resetIdleTimer();
            }
        });

        function checkVidStatus() {
            const videos = document.querySelectorAll('video');
            for (const video of videos) {
                if (!video.paused && !video.ended && video.readyState > 2) {
                    return true;
                }
            }
            return false;
        }

        const idleTimeoutLimit = 10 * 1000;
        let idleTimer: ReturnType<typeof setTimeout> | null = null;

        // Fires when the page has gone idle
        function handlePageIdle() {
            if (sessionStatus && !checkVidStatus()) {
                console.log(`Page is now idle.`);
                endSession();
            } else {
                resetIdleTimer();
            }
        }

        // Fires when there is user activity or refires when video playing
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
            console.log('Resetting idle timer.');
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

        console.log('All detection processes loaded.');

        // Starts session tracking only if the page is not hidden
        if (!document.hidden && !sessionStatus) {
            console.log('Starting the first session.');
            startSession();
        }
    },
});
