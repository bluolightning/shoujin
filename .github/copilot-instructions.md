# Shoujin Web Extension – Copilot Instructions

Purpose: Make AI agents productive quickly in this repo. Keep changes small, follow existing patterns, and verify with the provided scripts.

## Big picture

- Built with WXT (web extension toolkit) + React + TypeScript. Default browser target is Chrome (`wxt.config.ts`), with Firefox scripts available.
- Three parts:
    1. Background service worker (`src/entrypoints/background.ts`) – tracks sessions and persists data.
    2. Content script (`src/entrypoints/content.ts`) – observes user activity on all pages and pings background.
    3. Dashboard SPA (`src/entrypoints/MainPage/`) – reads from storage and renders charts with Mantine.

## Data and storage model

- Source of truth: `StorageManager` (`src/utils/storage.ts`). Key methods: `savePageTime(url, seconds, favicon, countAsVisit)`, `getAllStoredData()`, `clearAllData()`, `importData(data)`.
- `PageTimeEntry` shape: `{ url, timeSpent, lastVisitedISO, favicon?, dateData, visitCount }`.
    - `dateData` maps `YYYY-MM-DD` to `{ dailyTime, hours }`; `hours` uses keys `h0…h23`.
    - `savePageTime` splits seconds across hour boundaries and sorts entries by `timeSpent` desc. Visits increment only when `seconds >= 5`.

## Session tracking (background)

- Events from the browser are funneled through a single `QueueProcessor` (`src/utils/QueueProcessor.ts`) to avoid races. Supported events: `tabActivated`, `urlUpdated`, `tabRemoved`, `focusChanged`.
- Core functions: `startNewSession(tabId)`, `endCurrentSession()`, `handleUserActivity(tabId)` with an activity-idle timer (15s). Losing focus or switching tabs ends the current session.
- Always enqueue events: from listeners, call `eventQueue.enqueue('eventType', payload)` and handle in the switch inside `handleEvent`.
- URLs are normalized via `getBaseUrl` (origin only) and `formatUrl` (strip protocol/www). Favicons via `getFavicon` (active tab favicon or Google service fallback).

Example (add a new background event):

- Extend `EventPayloadMap` in `src/utils/QueueProcessor.ts`.
- Enqueue in the listener: `eventQueue.enqueue('newEvent', payload)`.
- Handle in `handleEvent` switch; call `endCurrentSession()`/`startNewSession()` as needed (avoid calling them directly from listeners).

## Content script behavior

- Injected on `<all_urls>` with `allFrames: true`. Throttles `user-activity` messages to 2000ms. Iframe activity is proxied to the top window via `postMessage`.
- On initial visible+focused load, it sends one activity ping to kick off tracking.

## Dashboard patterns

- Router mounts at `MainPage.html` (`App.tsx`). `Dashboard.tsx` loads all data once via `StorageManager.getAllStoredData()` then filters by date range using `filterDataByDate`.
- UI uses Mantine providers (`MantineProvider`, `ModalsProvider`, `Notifications`). Charts/components live in `src/components/`.
- Date range sharing uses `dateRangeContext` (`src/utils/dateRangeContext.ts`).
- Note: `src/entrypoints/MainPage/Settings.tsx` currently returns an empty fragment; to surface data tools, render `<DataSettings />` from `src/components/DataSettings.tsx`.

## Development workflows

- Scripts (`package.json`):
    - `npm run dev` (Chrome, HMR via WXT), `npm run dev:firefox`.
    - `npm run build` and `npm run zip` (and `:*:firefox`).
    - `npm run compile` for TS type-check only.
- Permissions declared in `wxt.config.ts`: `tabs`, `storage`, `idle`, `activeTab`.

## Coding Conventions & Patterns

- **UI**: The UI is built with React and [Mantine](https://mantine.dev/). When adding or modifying UI, please use Mantine components and follow their documentation for consistency.
- **State Management**: The dashboard's state is primarily managed within components using `useState` and `useEffect`. Data is fetched from `StorageManager` and then passed down through props or React Context (`dateRangeContext`).
- **Asynchronous Operations**: The background script heavily relies on async/await for handling browser APIs. Be mindful of Promises and potential race conditions. The `QueueProcessor` is in place to help with this.
- **Modularity**: Keep components and utility functions focused on a single responsibility. For example, UI components are in `src/components`, and data-related logic is in `src/utils`.
