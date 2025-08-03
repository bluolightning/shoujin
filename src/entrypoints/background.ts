import {StorageManager} from '@/modules/storage';
import getFavicon from '@/utils/getFavicon';
import formatUrl from '@/utils/formatUrl';
import getBaseUrl from '@/utils/getBaseUrl';

export default defineBackground(() => {
    let activeTabId: number | null = null;
    let activeTabUrl: string | null = null;
    let sessionStartTime: number | null = null;
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
            clearTimeout(activityIdleTimer);
            activityIdleTimer = null;
        } else {
            console.warn('No activity idle timer to clear.');
        }
    }

    async function handleUserActivity(tabId: number | undefined) {
        if (tabId == undefined) {
            console.error('Tab ID is required for user activity handling');
        } else if (!(tabId == activeTabId)) {
            // The current tab is not the active one, so we need to start a new session
            console.log('User activity detected on a new tab');
            if (sessionStartTime) {
                endCurrentSession();
            }
            await startNewSession(tabId);
            return;
        }

        // If we were idle, become active again
        if (isIdle) {
            console.log('User activity detected, idle state exited');
            isIdle = false;
        } else if (!sessionStartTime && activeTabId) {
            // If browser is focused but no active session, start one
            console.log('Browser focused with activity but no session - starting new session');
            await startNewSession(activeTabId);
        } else {
            // Just reset the timer if we're already active
            resetActivityIdleTimer();
        }
    }

    // --- Core Session Management Functions ---

    async function endCurrentSession() {
        // Check if the session is already ending or if there is no active session
        if (!sessionStartTime || !activeTabId || !activeTabUrl) {
            console.warn('No active session to end.');
            return;
        }

        const endTime = Date.now();
        const timeSpent = Math.round((endTime - sessionStartTime) / 1000);

        console.log(`Ending session for ${activeTabUrl}. Duration: ${timeSpent}s`);

        const data = tabData.get(activeTabId);
        const formattedUrl = formatUrl(activeTabUrl);

        await StorageManager.savePageTime(formattedUrl, timeSpent, data?.favicon, timeSpent >= 5);

        resetSession();
        clearActivityIdleTimer();
    }

    function resetSession() {
        sessionStartTime = null;
        activeTabUrl = null;
        activeTabId = null;
    }

    async function startNewSession(tabId: number) {
        // Don't track when idle or unfocused
        if (isIdle || sessionStartTime) {
            console.warn(
                `New session called for ${tabId} while browser is idle or in a current session.`
            );
            return;
        }

        const tab = await browser.tabs.get(tabId);
        // Special url - local file or inaccessible tab
        if (!tab.url || !(tab.url.startsWith('http') || tab.url.startsWith('file:'))) {
            console.log(`Tab ${tabId} is a special url. Pausing session tracking.`);
            return;
        }

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

    // --- Browser Event Listeners ---

    //  When the user changes tabs
    browser.tabs.onActivated.addListener(async (activeInfo) => {
        console.log(`Tab activated: ${activeInfo.tabId}`);
        if (sessionStartTime !== null) {
            await endCurrentSession();
        }
        await startNewSession(activeInfo.tabId);
    });

    // When the user navigates within the same tab
    browser.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
        // If the url changes in the active tab, end and start a new session
        if (tabId === activeTabId && changeInfo.url) {
            console.log(`URL updated in active tab: ${changeInfo.url}`);
            await endCurrentSession();

            tabData.delete(tabId); // Clear old favicon data for this tab

            await startNewSession(tabId);
        }
    });

    // When a tab is closed, clean up its data
    browser.tabs.onRemoved.addListener(async (tabId) => {
        if (tabId === activeTabId) {
            await endCurrentSession();
        }
        tabData.delete(tabId);
        console.log(`Tab ${tabId} closed and data cleaned up.`);
    });

    // Listener for activity pings from content scripts
    browser.runtime.onMessage.addListener(async (message, sender) => {
        if (message.type === 'user-activity') {
            console.log('User activity detected from content script');
            await handleUserActivity(sender.tab?.id || undefined);
        }
    });

    // Initial state check on startup
    browser.windows.getCurrent().then((window) => {
        if (window.focused) {
            browser.tabs.query({active: true, windowId: window.id}).then(([tab]) => {
                if (tab.id) startNewSession(tab.id);
            });
        }
    });
});
