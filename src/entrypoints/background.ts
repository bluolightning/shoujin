import {StorageManager} from '@/utils/storage';
import getFavicon from '@/utils/getFavicon';
import formatUrl from '@/utils/formatUrl';
import getBaseUrl from '@/utils/getBaseUrl';
import {QueueProcessor, QueueEvent} from '@/utils/QueueProcessor';

export default defineBackground(() => {
    let activeTabId: number | null = null;
    let activeTabUrl: string | null = null;
    let sessionStartTime: number | null = null;
    let isIdle = false;
    let isSessionEnding = false;
    let isBrowserFocused = true;

    const tabData = new Map<number, {favicon?: string; url: string}>();

    const idleTimeoutLimit = 15 * 1000; // Set your idle time in milliseconds (minimum 15 seconds)
    let activityIdleTimer: ReturnType<typeof setTimeout> | null = null;

    // --- Idle Time Management  functions ---

    function resetActivityIdleTimer() {
        // Clear existing timer
        if (activityIdleTimer) {
            clearTimeout(activityIdleTimer);
            activityIdleTimer = null;
        }

        // If we have an active session and browser is focused, start the timer
        if (sessionStartTime && !isIdle) {
            activityIdleTimer = setTimeout(async () => {
                console.log('Activity-based idle timeout reached');
                isIdle = true;
                await endCurrentSession();
            }, idleTimeoutLimit);
        }
    }

    function clearActivityIdleTimer() {
        if (activityIdleTimer) {
            console.log('Clearing activity idle timer');
            clearTimeout(activityIdleTimer);
            activityIdleTimer = null;
        } else {
            console.warn('No activity idle timer to clear.');
        }
    }

    async function handleUserActivity(tabId: number | undefined): Promise<void> {
        if (!isBrowserFocused) {
            console.log('Browser is not focused, ignoring user activity');
            return;
        }

        if (tabId == undefined) {
            console.error('Tab ID is required for user activity handling');
            return;
        }

        if (tabId !== activeTabId) {
            console.log(`User activity detected on a new tab (New: ${tabId}, Old: ${activeTabId})`);
            if (sessionStartTime) {
                await endCurrentSession();
            }
            await startNewSession(tabId);
            return;
        }

        if (!sessionStartTime) {
            console.log('No active session, starting new session');
            await startNewSession(tabId);
            return;
        }

        resetActivityIdleTimer();
    }

    // --- Core Session Management Functions ---

    async function endCurrentSession() {
        if (isSessionEnding) {
            console.log('Session end already in progress. Skipping duplicate call.');
            return;
        }

        if (!sessionStartTime || !activeTabId || !activeTabUrl) {
            console.warn('No active session to end.');
            return;
        }

        // Calculate and store the time spent in the session
        try {
            isSessionEnding = true;

            const endTime = Date.now();
            const timeSpent = Math.round((endTime - sessionStartTime) / 1000);

            console.log(`Ending session for ${activeTabUrl}. Duration: ${timeSpent}s`);

            const data = tabData.get(activeTabId);
            const formattedUrl = formatUrl(activeTabUrl);

            await StorageManager.savePageTime(
                formattedUrl,
                timeSpent,
                data?.favicon,
                timeSpent >= 5
            );

            resetSession();
            clearActivityIdleTimer();
        } finally {
            isSessionEnding = false;
        }
    }

    function resetSession() {
        sessionStartTime = null;
        activeTabUrl = null;
        activeTabId = null;
    }

    async function startNewSession(tabId: number) {
        // Don't track when idle or unfocused
        if (sessionStartTime) {
            console.warn(`New session called for ${tabId} while browser is in a session.`);
            return;
        }

        const tab = await browser.tabs.get(tabId);
        // Special url - inaccessible or restricted tab
        if (!tab.url || !(tab.url.startsWith('http') || tab.url.startsWith('file:'))) {
            console.log(`Tab ${tabId} is a special url. Pausing session tracking.`);
            return;
        }

        isIdle = false;
        activeTabId = tab.id || null;
        activeTabUrl = getBaseUrl(tab.url);
        sessionStartTime = Date.now();

        console.log(`Starting new session for tab ${activeTabId} on ${activeTabUrl}`);

        // Fetch and store favicon/URL info
        if (!tabData.has(tabId)) {
            const favicon = await getFavicon(activeTabUrl);
            tabData.set(tabId, {url: activeTabUrl, favicon});
        }

        // Start the activity-based idle timer
        resetActivityIdleTimer();
    }

    // --- Queue Processor ---

    async function handleEvent(event: QueueEvent): Promise<void> {
        switch (event.type) {
            case 'tabActivated': {
                const {tabId} = event.payload.activeInfo;
                if (activeTabId && activeTabId !== tabId) {
                    await endCurrentSession();
                }
                await startNewSession(tabId);
                break;
            }
            case 'tabRemoved': {
                const {tabId} = event.payload;
                if (tabId === activeTabId) {
                    await endCurrentSession();
                }
                tabData.delete(tabId);
                console.log(`Tab ${tabId} data cleaned up.`);
                break;
            }
            case 'urlUpdated': {
                const {tabId} = event.payload;
                const updatedTab = await browser.tabs.get(tabId);

                if (updatedTab.active) {
                    if (activeTabId) {
                        await endCurrentSession();
                    }
                    tabData.delete(tabId);
                    await startNewSession(tabId);
                }

                break;
            }
            case 'focusChanged': {
                const {windowId} = event.payload;
                if (windowId === browser.windows.WINDOW_ID_NONE) {
                    isBrowserFocused = false;
                    if (sessionStartTime) {
                        console.log('Browser window lost focus, ending current session.');
                        await endCurrentSession();
                    }

                    console.log('Browser window lost focus.');
                    return;
                }

                isBrowserFocused = true;
                try {
                    // Query the active tab in the focused window and start a session for that tab
                    const tabs = await browser.tabs.query({active: true, windowId});
                    const tab = tabs?.[0];

                    if (tab?.id != null) {
                        if (activeTabId && sessionStartTime) {
                            await endCurrentSession();
                        }
                        await startNewSession(tab.id);
                    } else {
                        // No active tab found for the focused window
                        if (sessionStartTime) await endCurrentSession();
                    }
                } catch (err) {
                    console.error('Error handling window focus change', err);
                }

                console.log('Browser window regained focus.');
                break;
            }
        }
    }

    const eventQueue = new QueueProcessor(handleEvent);

    // --- Browser Event Listeners ---

    // Start a new session when a different tab is activated
    browser.tabs.onActivated.addListener(async (activeInfo) => {
        eventQueue.enqueue('tabActivated', {activeInfo});
    });

    browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
        const currentTab = await browser.tabs.get(tabId);
        if (currentTab.active && changeInfo.url) {
            eventQueue.enqueue('urlUpdated', {tabId});
        }
    });

    // When a tab is closed, clean up its data
    browser.tabs.onRemoved.addListener(async (tabId) => {
        eventQueue.enqueue('tabRemoved', {tabId});
    });

    // Listener for activity pings from content scripts
    browser.runtime.onMessage.addListener(async (message, sender) => {
        if (message.type === 'user-activity') {
            console.log(`User activity detected from content script`);
            await handleUserActivity(sender.tab?.id || undefined);
        }
    });

    // End or start sessions based on the focused window
    browser.windows.onFocusChanged.addListener(async (windowId) => {
        eventQueue.enqueue('focusChanged', {windowId});
    });

    // Initial activity check on startup
    browser.windows.getCurrent().then((window) => {
        isBrowserFocused = !!window?.focused;
        if (window.focused) {
            browser.tabs.query({active: true, windowId: window.id}).then(([tab]) => {
                if (tab.id) startNewSession(tab.id);
            });
        }
    });
});
