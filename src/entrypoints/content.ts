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

        // Listen for iframe activity
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

        // --- Video Playback Detection ---
        let isMediaPlaying = false;

        // Function to send media state to the background script
        const notifyBackgroundOfMediaState = (isPlaying: boolean) => {
            // Only send message if the state changes
            if (isPlaying !== isMediaPlaying) {
                isMediaPlaying = isPlaying;
                console.log(`Media state changed. Is playing: ${isPlaying}`);
                browser.runtime.sendMessage({
                    type: isPlaying ? 'media-playing' : 'media-paused',
                });
            }
        };

        // Checks all media elements on the page to determine overall playback state
        const checkAllMedia = () => {
            const mediaElements = document.querySelectorAll('video, audio');
            // If any element is not paused, we consider media to be playing.
            const anyMediaPlaying = Array.from(mediaElements).some((el) => {
                const media = el as HTMLMediaElement;
                return !media.paused && !media.ended && media.readyState > 2;
            });
            notifyBackgroundOfMediaState(anyMediaPlaying);
        };

        // Attach listeners to a given media element
        const addMediaListeners = (mediaElement: HTMLMediaElement) => {
            mediaElement.addEventListener('play', checkAllMedia, {passive: true});
            mediaElement.addEventListener('playing', checkAllMedia, {passive: true});
            mediaElement.addEventListener('pause', checkAllMedia, {passive: true});
            mediaElement.addEventListener('ended', checkAllMedia, {passive: true});
            mediaElement.addEventListener('emptied', checkAllMedia, {passive: true});
        };

        // Find all existing media elements and attach listeners
        document
            .querySelectorAll('video, audio')
            .forEach((el) => addMediaListeners(el as HTMLMediaElement));

        // Use a MutationObserver to detect when new video/audio tags are added to the DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node instanceof HTMLMediaElement) {
                        addMediaListeners(node);
                        checkAllMedia(); // Re-check state when a new element is added
                    } else if (node.nodeType === 1) {
                        // Check for elements
                        (node as Element)
                            .querySelectorAll('video, audio')
                            .forEach((el) => addMediaListeners(el as HTMLMediaElement));
                    }
                });
            });
            // Also re-check if an element is removed, as it might have been the only one playing
            if (mutations.some((m) => m.removedNodes.length > 0)) {
                checkAllMedia();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        console.log('Content script loaded and activity listeners set up.');

        if (document.visibilityState === 'visible' && document.hasFocus()) {
            console.log('Initial page focus detected');
            notifyBackground();
        }
    },
});
