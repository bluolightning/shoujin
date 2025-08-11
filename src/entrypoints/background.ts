import {StorageManager} from '@/utils/storage';
import getFavicon from '@/utils/getFavicon';
import formatUrl from '@/utils/formatUrl';
import getBaseUrl from '@/utils/getBaseUrl';
import {QueueProcessor, QueueEvent} from '@/utils/QueueProcessor';

export default defineBackground(() => {
    const activeSessions = new Map<
        number,
        {
            url: string;
            startTime: number;
            isMedia: boolean; // Is this session active because of media?
            favicon?: string;
        }
    >();

    let focusedTabId: number | null = null;
    let focusedWindowId: number | null = browser.windows.WINDOW_ID_NONE;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const idleTimeoutLimit = 15 * 1000; // Minimum 15 seconds

    // --- Core Session Management ---

    async function startSession(tabId: number, isMediaSession: boolean = false) {
        if (activeSessions.has(tabId)) {
            console.warn(`New session called for ${tabId} while tab is in a session.`);
            return;
        }

        try {
            const tab = await browser.tabs.get(tabId);
            if (!tab.url || !(tab.url.startsWith('http') || tab.url.startsWith('file:'))) {
                return; // Don't track special URLs
            }

            const url = getBaseUrl(tab.url);
            const favicon = await getFavicon(url);

            activeSessions.set(tabId, {
                url: url,
                startTime: Date.now(),
                isMedia: isMediaSession,
                favicon: favicon,
            });

            console.log(
                `Starting session for tab ${tabId} (${isMediaSession ? 'Media' : 'Focus'}). URL: ${url}`
            );

            // If the newly focused tab is starting a session, reset the global idle timer.
            if (!isMediaSession) {
                resetIdleTimer();
            }
        } catch (error) {
            console.error(`Error starting session for tab ${tabId}:`, error);
        }
    }

    async function endSession(tabId: number) {
        const session = activeSessions.get(tabId);
        if (!session) {
            return; // No session to end
        }

        const endTime = Date.now();
        const timeSpent = Math.round((endTime - session.startTime) / 1000);

        activeSessions.delete(tabId);
        console.log(`Ending session for tab ${tabId}. Duration: ${timeSpent}s`);

        const formattedUrl = formatUrl(session.url);
        await StorageManager.savePageTime(formattedUrl, timeSpent, session.favicon, timeSpent >= 5);
    }

    async function endAllSessions() {
        const allSessionIds = Array.from(activeSessions.keys());
        console.log(`Ending all ${allSessionIds.length} active sessions.`);
        for (const tabId of allSessionIds) {
            await endSession(tabId);
        }
    }

    async function handleFocusChange(newTabId: number | null) {
        const oldFocusedTabId = focusedTabId;

        if (oldFocusedTabId === newTabId) {
            return;
        }

        // End the previous session if it was a focus-based one
        if (oldFocusedTabId) {
            await endSession(oldFocusedTabId);
        }

        // Start a new session for the newly focused tab
        if (newTabId) {
            await startSession(newTabId, false);
        }
    }

    // Idle timer - only for non-media, focused tabs
    function resetIdleTimer() {
        if (idleTimer) clearTimeout(idleTimer);

        // If the focused tab is also playing media, it won't go idle.
        const focusedSession = focusedTabId ? activeSessions.get(focusedTabId) : null;
        if (focusedTabId && focusedSession && !focusedSession.isMedia) {
            console.log(`Setting idle timer for focused tab ${focusedTabId}`);
            idleTimer = setTimeout(async () => {
                console.log(`Idle timeout reached for focused tab ${focusedTabId}.`);
                if (focusedTabId) {
                    await endSession(focusedTabId); // End only the focused tab's session
                }
            }, idleTimeoutLimit);
        }
    }

    // --- Browser Event Listeners ---

    browser.windows.onFocusChanged.addListener(async (windowId) => {
        focusedWindowId = windowId; // Update our record of the focused window

        if (windowId === browser.windows.WINDOW_ID_NONE) {
            // Browser lost focus, end the current focused session.
            console.log('Browser lost focus.');
            await handleFocusChange(null); // End focused tab session
        } else {
            // Browser gained focus, find the active tab in this window.
            console.log(`Window ${windowId} gained focus.`);
            const [currentTab] = await browser.tabs.query({active: true, windowId: windowId});
            if (currentTab?.id) {
                await handleFocusChange(currentTab.id);
            }
        }
    });

    browser.tabs.onActivated.addListener(async (activeInfo) => {
        if (activeInfo.windowId === focusedWindowId) {
            console.log(`Tab activated in focused window: ${activeInfo.tabId}`);
            await handleFocusChange(activeInfo.tabId);
        }
    });

    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
        if (tabId === focusedTabId && changeInfo.url) {
            console.log(`Focused tab ${tabId} navigated. Restarting session.`);
            await handleFocusChange(null); // End  focused tab session
            await handleFocusChange(tabId);
        }
    });

    browser.tabs.onRemoved.addListener(async (tabId) => {
        if (tabId === focusedTabId) {
            await handleFocusChange(null); // End focused tab session
        } else if (activeSessions.has(tabId)) {
            // A background tab with an active (media) session was closed
            await endSession(tabId);
        }
    });

    browser.runtime.onMessage.addListener(async (message, sender) => {
        const tabId = sender.tab?.id;
        if (!tabId) return;

        switch (message.type) {
            case 'user-activity': {
                if (tabId === focusedTabId) {
                    if (activeSessions.has(tabId)) {
                        resetIdleTimer();
                    } else {
                        console.log(`User activity on idle tab ${tabId}. Restarting session.`);
                        await startSession(tabId, false);
                    }
                }

                break;
            }

            case 'media-playing': {
                console.log(`Media started on tab ${tabId}. Starting a media session.`);
                const session = activeSessions.get(tabId);

                // Start a session for this tab, marking it as a media session
                if (!session) {
                    await startSession(tabId, true);
                } else {
                    session.isMedia = true;
                    if (tabId === focusedTabId) {
                        if (idleTimer) clearTimeout(idleTimer);
                    }
                }
                break;
            }

            case 'media-paused': {
                console.log(`Media paused on tab ${tabId}.`);
                const pausedSession = activeSessions.get(tabId);
                if (pausedSession && pausedSession.isMedia) {
                    if (tabId !== focusedTabId) {
                        await endSession(tabId);
                    } else {
                        pausedSession.isMedia = false;
                        resetIdleTimer();
                    }
                }
                break;
            }
        }
    });

    browser.idle.onStateChanged.addListener(async (newState) => {
        console.log(`System idle state changed to: ${newState}`);
        if (newState === 'idle' || newState === 'locked') {
            await endAllSessions();
        } else if (newState === 'active') {
            const [currentTab] = await browser.tabs.query({active: true, currentWindow: true});
            if (currentTab?.id && !activeSessions.has(currentTab.id)) {
                console.log('User is active again, restarting session for focused tab.');
                await startSession(currentTab.id, false);
            }
        }
    });

    // Initial startup logic
    browser.windows.getCurrent({populate: true}).then(async (window) => {
        if (window.focused) {
            const activeTab = window.tabs?.find((t) => t.active);
            if (activeTab?.id) {
                focusedTabId = activeTab.id;
                await startSession(focusedTabId, false);
            }
        }
    });
});
