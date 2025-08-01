import {StorageManager} from '@/modules/storage';
import getFavicon from '@/utils/getFavicon';
import formatUrl from '@/utils/formatUrl';

export default defineBackground(() => {
    let activeTabId: number | null = null;
    let activeTabUrl: string | null = null;
    let sessionStartTime: number | null = null;
    let isBrowserFocused = false;
    let isIdle = false;

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
        if (sessionStartTime && isBrowserFocused && !isIdle) {
            activityIdleTimer = setTimeout(async () => {
                console.log('Activity-based idle timeout reached');
                isIdle = true;
                await endCurrentSession();
            }, idleTimeoutLimit);
        }
    }

    function clearActivityIdleTimer() {
        if (activityIdleTimer) {
            clearTimeout(activityIdleTimer);
            activityIdleTimer = null;
        } else {
            console.warn('No activity idle timer to clear.');
        }
    }

    async function handleUserActivity() {
        // If we were idle, become active again
        if (isIdle) {
            console.log('User activity detected, exiting idle state');
            isIdle = false;

            // Restart session on current tab if browser is focused
            if (isBrowserFocused && activeTabId) {
                await startNewSession(activeTabId);
            }
        } else {
            // Just reset the timer if we're already active
            resetActivityIdleTimer();
        }
    }

    // --- Core Session Management Functions ---

    async function endCurrentSession() {
        if (!sessionStartTime || !activeTabId || !activeTabUrl) {
            console.warn('No active session to end.');
            return; // No active session to end
        }

        const endTime = Date.now();
        const timeSpent = Math.round((endTime - sessionStartTime) / 1000);

        console.log(`Ending session for ${activeTabUrl}. Duration: ${timeSpent}s`);

        const data = tabData.get(activeTabId);
        const formattedUrl = formatUrl(activeTabUrl);

        // It can check if a URL already exists in storage.
        await StorageManager.savePageTime(formattedUrl, timeSpent, data?.favicon, timeSpent >= 5);

        // Clean up
        resetSession();
        clearActivityIdleTimer();
    }

    function resetSession() {
        sessionStartTime = null;
        activeTabUrl = null;
        // Keep activeTabId for now, but clear the session start time
    }

    async function startNewSession(tabId: number) {
        // End any previous session
        await endCurrentSession();

        const tab = await browser.tabs.get(tabId);
        // Only track http/https tabs, and don't track when idle or window is not focused
        if (!tab.url || !tab.url.startsWith('http') || isIdle || !isBrowserFocused) {
            return;
        }

        activeTabId = tab.id;
        activeTabUrl = tab.url;
        sessionStartTime = Date.now();

        console.log(`Starting new session for tab ${activeTabId} on ${activeTabUrl}`);

        // Fetch and store favicon/URL info
        if (!tabData.has(tabId)) {
            const favicon = await getFavicon(tab.url);
            tabData.set(tabId, {url: tab.url, favicon});
        }

        // Start the activity-based idle timer
        resetActivityIdleTimer();
    }

    // --- Browser Event Listeners ---

    // 1. When the user changes tabs
    browser.tabs.onActivated.addListener(async (activeInfo) => {
        console.log(`Tab activated: ${activeInfo.tabId}`);
        await startNewSession(activeInfo.tabId);
    });

    // 2. When the user changes the browser window
    browser.windows.onFocusChanged.addListener(async (windowId) => {
        isBrowserFocused = windowId !== browser.windows.WINDOW_ID_NONE;
        console.log(`Browser focus changed: ${isBrowserFocused}`);

        if (isBrowserFocused) {
            // Find the active tab in the newly focused window and start a session
            const [activeTab] = await browser.tabs.query({active: true, windowId: windowId});
            if (activeTab?.id) {
                await startNewSession(activeTab.id);
            }
        } else {
            // Browser lost focus, end the current session
            await endCurrentSession();
        }
    });

    // 3. When the user navigates within the same tab
    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
        // We only care if the URL changed in the currently active tab
        if (tabId === activeTabId && changeInfo.url) {
            console.log(`URL updated in active tab: ${changeInfo.url}`);
            // The URL changed, so the old session ends and a new one starts.
            await startNewSession(tabId);
            // Update tab data with new URL and potentially new favicon
            const favicon = await getFavicon(changeInfo.url);
            tabData.set(tabId, {url: changeInfo.url, favicon});
        }
    });

    // 4. When a tab is closed, clean up its data
    browser.tabs.onRemoved.addListener(async (tabId) => {
        if (tabId === activeTabId) {
            await endCurrentSession();
        }
        tabData.delete(tabId);
        console.log(`Tab ${tabId} closed and data cleaned up.`);
    });

    // 5. Browser Idle API (fallback)
    browser.idle.setDetectionInterval(idleTimeoutLimit / 1000);
    browser.idle.onStateChanged.addListener(async (newState) => {
        console.log(`Browser idle state changed to: ${newState}`);
        const wasIdle = isIdle;
        isIdle = newState !== 'active';

        if (isIdle && !wasIdle) {
            // Browser just became idle, end the session
            clearActivityIdleTimer();
            await endCurrentSession();
        } else if (!isIdle && wasIdle) {
            // Browser is active again, start a new session on the current tab
            if (activeTabId && isBrowserFocused) {
                await startNewSession(activeTabId);
            }
        }
    });

    // 6. Listener for activity pings from content scripts
    browser.runtime.onMessage.addListener(async (message, sender) => {
        if (message.type === 'user-activity') {
            console.log('User activity detected from content script');
            await handleUserActivity();
        }
    });

    // Initial state check on startup
    browser.windows.getCurrent().then((window) => {
        isBrowserFocused = window.focused;
        if (isBrowserFocused) {
            browser.tabs.query({active: true, windowId: window.id}).then(([tab]) => {
                if (tab.id) startNewSession(tab.id);
            });
        }
    });
});
