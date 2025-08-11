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
                `[CONCURRENT] Starting session for tab ${tabId} (${isMediaSession ? 'Media' : 'Focus'}). URL: ${url}`
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
        console.log(`[CONCURRENT] Ending session for tab ${tabId}. Duration: ${timeSpent}s`);

        const formattedUrl = formatUrl(session.url);
        await StorageManager.savePageTime(formattedUrl, timeSpent, session.favicon, timeSpent >= 5);
    }

    async function endAllSessions() {
        const allSessionIds = Array.from(activeSessions.keys());
        console.log(`[CONCURRENT] Ending all ${allSessionIds.length} active sessions.`);
        for (const tabId of allSessionIds) {
            await endSession(tabId);
        }
    }

    // Idle timer - only for non-media, focused tabs
    function resetIdleTimer() {
        if (idleTimer) clearTimeout(idleTimer);

        // If the focused tab is also playing media, it won't go idle.
        const focusedSession = focusedTabId ? activeSessions.get(focusedTabId) : null;
        if (focusedSession && !focusedSession.isMedia) {
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

    browser.tabs.onActivated.addListener(async (activeInfo) => {
        const {tabId} = activeInfo;

        // End the previous focused session *if it wasn't a media session*
        if (focusedTabId && focusedTabId !== tabId) {
            const oldSession = activeSessions.get(focusedTabId);
            if (oldSession && !oldSession.isMedia) {
                await endSession(focusedTabId);
            }
        }

        focusedTabId = tabId;
        await startSession(tabId, false); // Start a new session for the focused tab
    });

    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
        if (tab.active && changeInfo.url) {
            // If the focused tab navigates, end its old session and start a new one
            if (activeSessions.has(tabId)) {
                await endSession(tabId);
            }
            await startSession(tabId, false);
        }
    });

    browser.tabs.onRemoved.addListener(async (tabId) => {
        if (activeSessions.has(tabId)) {
            await endSession(tabId);
        }
        if (tabId === focusedTabId) {
            focusedTabId = null;
        }
    });

    browser.runtime.onMessage.addListener(async (message, sender) => {
        const tabId = sender.tab?.id;
        if (!tabId) return;

        switch (message.type) {
            case 'user-activity': {
                // Activity will be ignored for non-focused tabs
                if (tabId === focusedTabId) {
                    // If the user becomes active, restart the session if it went idle.
                    if (!activeSessions.has(tabId)) {
                        await startSession(tabId, false);
                    } else {
                        resetIdleTimer();
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
        console.log(`[IDLE] System idle state changed to: ${newState}`);
        if (newState === 'idle' || newState === 'locked') {
            await endAllSessions();
        } else if (newState === 'active') {
            const [currentTab] = await browser.tabs.query({active: true, currentWindow: true});
            if (currentTab?.id && !activeSessions.has(currentTab.id)) {
                console.log('[IDLE] User is active again, restarting session for focused tab.');
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
