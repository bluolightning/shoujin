import {StorageManager} from '@/utils/storage';
import getFavicon from '@/utils/getFavicon';
import formatUrl from '@/utils/formatUrl';
import getBaseUrl from '@/utils/getBaseUrl';
import {QueueProcessor, QueueEvent} from '@/utils/QueueProcessor';
import {SettingsStorage, AppSettings} from '@/utils/settingsStorage';
import {isSiteBlocked} from '@/utils/siteLimitsStorage';

export default defineBackground(() => {
    let activeTabId: number | null = null;
    let activeTabUrl: string | null = null;
    let sessionStartTime: number | null = null;
    let isIdle = false;
    let isSessionEnding = false;
    let settings: AppSettings;
    let idleTimeoutLimit = 15 * 1000; // Will be updated from settings

    const tabData = new Map<number, {favicon?: string; url: string}>();

    let activityIdleTimer: ReturnType<typeof setTimeout> | null = null;

    // --- Settings Management ---

    async function loadSettings() {
        settings = await SettingsStorage.getSettings();
        idleTimeoutLimit = settings.idleTimeout * 1000;
        console.log('Settings loaded:', settings);
    }

    function handleSettingChange(key: keyof AppSettings, value: AppSettings[keyof AppSettings]) {
        settings = {...settings, [key]: value};

        if (key === 'idleTimeout') {
            idleTimeoutLimit = (value as number) * 1000;
            // Reset timer with new timeout if session is active
            if (sessionStartTime && !isIdle) {
                resetActivityIdleTimer();
            }
        }

        if (key === 'trackingEnabled' && !value) {
            // If tracking is disabled, end current session
            if (sessionStartTime) {
                endCurrentSession();
            }
        }

        console.log(`Setting changed: ${key} = ${value}`);
    }

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
        // Check if tracking is enabled
        if (!settings?.trackingEnabled) {
            console.log('Tracking is disabled, ignoring user activity');
            return;
        }

        if (tabId == undefined) {
            console.error('Tab ID is required for user activity handling');
            return;
        }

        // Check if we should track private/incognito tabs
        if (!settings?.trackInPrivate) {
            try {
                const tab = await browser.tabs.get(tabId);
                if (tab.incognito) {
                    console.log('Tracking is disabled for incognito, ignoring user activity');
                    return;
                }
            } catch (error) {
                console.warn('Could not check if tab is incognito:', error);
            }
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

    // --- Site Blocking Functions ---

    async function checkSiteLimit(url: string): Promise<boolean> {
        try {
            const formattedUrl = formatUrl(url);
            const todayUsageMinutes = await StorageManager.getTodayUsage(formattedUrl);
            return await isSiteBlocked(formattedUrl, todayUsageMinutes);
        } catch (error) {
            console.error('Error checking site limit:', error);
            return false;
        }
    }

    async function blockSite(tabId: number, url: string) {
        try {
            const formattedUrl = formatUrl(url);
            const todayUsageMinutes = await StorageManager.getTodayUsage(formattedUrl);

            const pageUrl = browser.runtime.getURL(
                `/SiteBlocking.html?site=${encodeURIComponent(formattedUrl)}&minutes=${encodeURIComponent(String(todayUsageMinutes))}`
            );

            // Navigate the tab to the packaged blocking page
            await browser.tabs.update(tabId, {url: pageUrl});

            console.log(`Blocked access to ${formattedUrl} - time limit exceeded`);
        } catch (error) {
            console.error('Error blocking site:', error);
        }
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
            const minimumVisitTime = settings?.minimumVisitTime ?? 5;

            await StorageManager.savePageTime(
                formattedUrl,
                timeSpent,
                data?.favicon,
                timeSpent >= minimumVisitTime
            );

            tabData.delete(activeTabId);
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
        // Check if tracking is enabled
        if (!settings?.trackingEnabled) {
            console.log('Tracking is disabled, not starting session');
            return;
        }

        // Don't track when idle or unfocused
        if (sessionStartTime) {
            console.warn(`New session called for ${tabId} while browser is in a session.`);
            return;
        }

        const tab = await browser.tabs.get(tabId);

        // Check if we should track private/incognito tabs
        if (!settings?.trackInPrivate && tab.incognito) {
            console.log('Private/incognito tab detected and tracking disabled for private tabs');
            return;
        }

        // Special url - inaccessible or restricted tab
        if (!tab.url || !(tab.url.startsWith('http') || tab.url.startsWith('file:'))) {
            console.log(`Tab ${tabId} is a special url. Pausing session tracking.`);
            return;
        }

        const baseUrl = getBaseUrl(tab.url);

        // Check if the site is blocked due to time limits
        const isBlocked = await checkSiteLimit(baseUrl);
        if (isBlocked) {
            console.log(`Site ${baseUrl} is blocked due to time limit`);
            await blockSite(tabId, baseUrl);
            return;
        }

        isIdle = false;
        activeTabId = tab.id || null;
        activeTabUrl = baseUrl;
        sessionStartTime = Date.now();

        console.log(`Starting new session for tab ${activeTabId} on ${activeTabUrl}`);

        // Fetch and store favicon/URL info
        if (!tabData.has(tabId)) {
            const favicon = getFavicon(activeTabUrl, tab.favIconUrl, settings.useFaviconService);
            tabData.set(tabId, {url: activeTabUrl, favicon});
        }

        // Start the activity-based idle timer
        resetActivityIdleTimer();
    }

    // --- Queue Processor ---

    async function handleEvent(event: QueueEvent): Promise<void> {
        // Skip event processing if tracking is disabled
        if (!settings?.trackingEnabled) {
            console.log(`Tracking is disabled, skipping ${event.type} event`);
            return;
        }

        switch (event.type) {
            case 'userActivity': {
                const {tabId} = event.payload;
                await handleUserActivity(tabId);
                break;
            }
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

                if (!tabData.has(tabId)) {
                    console.log(`No stored data for closed tab ${tabId}`);
                    return;
                }

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
                console.log(`Window focus changed: ${windowId}`);
                if (windowId === browser.windows.WINDOW_ID_NONE) {
                    if (sessionStartTime) {
                        console.log('Browser window lost focus, ending current session.');
                        await endCurrentSession();
                    }

                    console.log('Browser window lost focus.');
                    return;
                }

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
                } catch (error) {
                    console.error('Error handling window focus change', error);
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

        // Check for site blocking when URL changes
        if (currentTab.active && changeInfo.url && changeInfo.url.startsWith('http')) {
            const baseUrl = getBaseUrl(changeInfo.url);
            const isBlocked = await checkSiteLimit(baseUrl);

            if (isBlocked) {
                console.log(`Blocking navigation to ${baseUrl} due to time limit`);
                await blockSite(tabId, baseUrl);
                return;
            }

            eventQueue.enqueue('urlUpdated', {tabId});
        }
    });

    // When a tab is closed, clean up its data
    browser.tabs.onRemoved.addListener(async (tabId) => {
        eventQueue.enqueue('tabRemoved', {tabId});
    });

    // Listener for activity pings from content scripts and settings changes
    browser.runtime.onMessage.addListener(async (message, sender) => {
        if (message.type === 'user-activity') {
            console.log(`User activity detected from content script`);
            eventQueue.enqueue('userActivity', {tabId: sender.tab?.id || undefined});
        } else if (message.type === 'setting-changed') {
            handleSettingChange(message.key, message.value);
        } else if (message.type === 'settings-reset') {
            await loadSettings();
        }
    });

    // End or start sessions based on the focused window
    browser.windows.onFocusChanged.addListener(async (windowId) => {
        eventQueue.enqueue('focusChanged', {windowId});
    });

    // Initial setup
    (async () => {
        try {
            // Load settings first
            await loadSettings();

            const lastFocused = await browser.windows.getLastFocused();

            if (
                lastFocused?.focused &&
                lastFocused.id != null &&
                lastFocused.id !== browser.windows.WINDOW_ID_NONE
            ) {
                // Enqueue a focus change so the QueueProcessor handles starting the session
                eventQueue.enqueue('focusChanged', {windowId: lastFocused.id});
            }
        } catch (error) {
            console.error('Error during initial setup', error);
        }
    })();
});
