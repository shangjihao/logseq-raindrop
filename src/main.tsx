import "@logseq/libs";

import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";
import BookmarkCards from "./components/BookmarkCards";
import { getBookmarksByTag, syncAll } from "./services/sync";
import { RaindropAPI } from "./services/raindrop-api";
import "./index.css";
import { syncLogseqTheme } from "./theme";

import { logseq as PL } from "../package.json";

const pluginId = PL.id;

const settingsSchema = [
  {
    key: "apiToken",
    type: "string",
    title: "Raindrop API Token",
    description:
      "Your Raindrop.io test token. Get it from https://app.raindrop.io/settings/integrations",
    default: "",
  },
  {
    key: "autoSync",
    type: "boolean",
    title: "Auto Sync on Startup",
    description: "Automatically sync bookmarks when Logseq starts",
    default: true,
  },
];

let bookmarkRoot: ReactDOM.Root | null = null;

function renderBookmarkCards(pageName: string | null) {
  const bookmarks = pageName ? getBookmarksByTag(pageName) : [];

  let container = parent.document.getElementById("raindrop-cards-container");
  if (!container) {
    container = parent.document.createElement("div");
    container.id = "raindrop-cards-container";
    parent.document.body.appendChild(container);
  }

  if (bookmarks.length === 0) {
    if (bookmarkRoot) {
      bookmarkRoot.unmount();
      bookmarkRoot = null;
    }
    container.style.display = "none";
    return;
  }

  container.style.display = "block";

  if (!bookmarkRoot) {
    bookmarkRoot = ReactDOM.createRoot(container);
  }

  bookmarkRoot.render(
    <React.StrictMode>
      <BookmarkCards key={pageName} bookmarks={bookmarks} tagName={pageName!} />
    </React.StrictMode>
  );
}

async function getCurrentPageName(): Promise<string | null> {
  const page = await logseq.Editor.getCurrentPage();
  if (page && "originalName" in page) {
    return (page.originalName as string) || (page.name as string) || null;
  }
  return null;
}

function main() {
  console.info(`#${pluginId}: MAIN`);

  // Register settings
  logseq.useSettingsSchema(settingsSchema as any);

  const stopThemeSync = syncLogseqTheme();

  // Render main panel UI
  const root = ReactDOM.createRoot(document.getElementById("app")!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  function createModel() {
    return {
      show() {
        logseq.showMainUI();
      },
    };
  }

  logseq.provideModel(createModel());
  logseq.setMainUIInlineStyle({
    zIndex: 11,
  });

  const openIconName = "raindrop-plugin-open";

  logseq.provideStyle(`
    .${openIconName} {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: var(--ls-icon-color, var(--ls-secondary-text-color, #6b7280));
    }
    .${openIconName}:hover {
      color: var(--ls-link-text-hover-color, var(--ls-link-text-color, #2563eb));
    }

    #raindrop-cards-container {
      color: var(--ls-primary-text-color, #111827);
      font-family: var(--ls-font-family, inherit);
    }

    /* Related bookmarks, directly below the current page title. */
    .raindrop-page-notice-container {
      margin: 8px 0 16px;
    }
    .raindrop-page-notice {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      width: 100%;
      box-sizing: border-box;
      padding: 8px 10px;
      border: 1px solid var(--ls-border-color, #e5e7eb);
      border-radius: 6px;
      background: var(--ls-secondary-background-color, #f9fafb);
      color: var(--ls-link-text-color, #2563eb);
      font-family: var(--ls-font-family, inherit);
      font-size: 13px;
      line-height: 1.5;
      text-align: left;
      cursor: pointer;
    }
    .raindrop-page-notice:hover {
      background: var(--ls-tertiary-background-color, #f3f4f6);
    }
    .raindrop-page-notice:focus-visible {
      outline: 2px solid var(--ls-link-text-color, #2563eb);
      outline-offset: 2px;
    }
    .raindrop-page-notice-icon {
      display: block;
      flex-shrink: 0;
    }
    .raindrop-page-notice-action {
      margin-left: auto;
      font-size: 12px;
      white-space: nowrap;
    }

    /* Right-side panel (dual-column layout) */
    .raindrop-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 360px;
      box-sizing: border-box;
      background: var(--ls-primary-background-color, #fff);
      z-index: 10;
      border-left: 1px solid var(--ls-border-color, #e5e7eb);
      transform: translateX(100%);
      transition: transform 0.25s ease;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .raindrop-panel-open {
      transform: translateX(0);
    }
    .raindrop-panel-resize {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 8px;
      z-index: 1;
      cursor: col-resize;
      touch-action: none;
      user-select: none;
    }
    .raindrop-panel-resize:hover,
    .raindrop-panel-resize:focus-visible,
    .raindrop-panel-resizing {
      background: var(--ls-link-text-color, #2563eb);
      opacity: 0.5;
      outline: none;
    }
    .raindrop-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid var(--ls-border-color, #e5e7eb);
      flex-shrink: 0;
    }
    .raindrop-panel-title {
      min-width: 0;
      overflow-wrap: anywhere;
      font-size: 14px;
      font-weight: 600;
      color: var(--ls-primary-text-color, #111827);
    }
    .raindrop-panel-count {
      color: var(--ls-secondary-text-color, #6b7280);
      font-weight: 400;
      margin-left: 6px;
    }
    .raindrop-panel-close {
      flex-shrink: 0;
      background: none;
      border: none;
      font-size: 16px;
      color: var(--ls-secondary-text-color, #6b7280);
      cursor: pointer;
      padding: 4px;
      line-height: 1;
    }
    .raindrop-panel-close:hover {
      color: var(--ls-primary-text-color, #374151);
    }
    .raindrop-panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* Bookmark card */
    .raindrop-card {
      min-width: 0;
      flex-shrink: 0;
      overflow-wrap: anywhere;
      background: var(--ls-primary-background-color, #fff);
      border: 1px solid var(--ls-border-color, #e5e7eb);
      border-radius: 8px;
      padding: 10px 12px;
      transition: box-shadow 0.15s;
    }
    .raindrop-card:hover {
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .raindrop-card-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--ls-link-text-color, #2563eb);
      text-decoration: none;
      line-height: 1.4;
      display: block;
    }
    .raindrop-card-title:hover {
      color: var(--ls-link-text-hover-color, var(--ls-link-text-color, #2563eb));
      text-decoration: underline;
    }
    .raindrop-card-meta {
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .raindrop-card-domain {
      font-size: 11px;
      color: var(--ls-secondary-text-color, #6b7280);
    }
    .raindrop-card-collection {
      font-size: 11px;
      background: var(--ls-tertiary-background-color, #f3f4f6);
      color: var(--ls-secondary-text-color, #4b5563);
      padding: 1px 6px;
      border-radius: 4px;
    }
    .raindrop-card-date {
      font-size: 11px;
      color: var(--ls-secondary-text-color, #6b7280);
    }
    .raindrop-card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin: 8px 0 0;
      padding: 0;
      list-style: none;
    }
    .raindrop-card-tag {
      max-width: 100%;
      box-sizing: border-box;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--ls-tertiary-background-color, #f3f4f6);
      color: var(--ls-secondary-text-color, #4b5563);
      font-size: 11px;
      line-height: 1.5;
      white-space: normal;
      overflow-wrap: anywhere;
    }
    .raindrop-card-note {
      margin-top: 6px;
      font-size: 12px;
      color: var(--ls-secondary-text-color, #6b7280);
      line-height: 1.6;
    }
    .raindrop-card-note > :first-child {
      margin-top: 0;
    }
    .raindrop-card-note > :last-child {
      margin-bottom: 0;
    }
    .raindrop-card-note p,
    .raindrop-card-note ul,
    .raindrop-card-note ol,
    .raindrop-card-note blockquote,
    .raindrop-card-note pre,
    .raindrop-note-table {
      margin: 0.6em 0;
    }
    .raindrop-card-note h1,
    .raindrop-card-note h2,
    .raindrop-card-note h3,
    .raindrop-card-note h4,
    .raindrop-card-note h5,
    .raindrop-card-note h6 {
      margin: 0.9em 0 0.4em;
      color: var(--ls-primary-text-color, #111827);
      font-weight: 600;
      line-height: 1.4;
    }
    .raindrop-card-note h1 { font-size: 16px; }
    .raindrop-card-note h2 { font-size: 15px; }
    .raindrop-card-note h3 { font-size: 14px; }
    .raindrop-card-note h4 { font-size: 13px; }
    .raindrop-card-note h5,
    .raindrop-card-note h6 { font-size: 12px; }
    .raindrop-card-note strong { font-weight: 600; }
    .raindrop-card-note em { font-style: italic; }
    .raindrop-card-note ul { list-style: disc; padding-left: 1.5em; }
    .raindrop-card-note ol { list-style: decimal; padding-left: 1.5em; }
    .raindrop-card-note li { margin: 0.2em 0; }
    .raindrop-card-note li > ul,
    .raindrop-card-note li > ol { margin: 0.2em 0; }
    .raindrop-card-note .task-list-item { list-style: none; }
    .raindrop-card-note input[type="checkbox"] {
      margin-right: 0.4em;
      accent-color: var(--ls-link-text-color, #2563eb);
    }
    .raindrop-card-note blockquote {
      border-left: 3px solid var(--ls-border-color, #e5e7eb);
      padding: 0 0.8em;
    }
    .raindrop-card-note a {
      color: var(--ls-link-text-color, #2563eb);
      text-decoration: underline;
    }
    .raindrop-card-note a:hover {
      color: var(--ls-link-text-hover-color, var(--ls-link-text-color, #2563eb));
    }
    .raindrop-card-note code {
      background: var(--ls-secondary-background-color, #f3f4f6);
      border-radius: 3px;
      padding: 0.1em 0.3em;
      font-family: monospace;
      font-size: 0.95em;
    }
    .raindrop-card-note pre {
      max-width: 100%;
      overflow-x: auto;
      background: var(--ls-secondary-background-color, #f3f4f6);
      border-radius: 4px;
      padding: 8px;
      white-space: pre;
      overflow-wrap: normal;
    }
    .raindrop-card-note pre code {
      background: none;
      padding: 0;
      white-space: inherit;
      overflow-wrap: normal;
      word-break: normal;
    }
    .raindrop-note-table { max-width: 100%; overflow-x: auto; }
    .raindrop-card-note table {
      width: 100%;
      border-collapse: collapse;
      font-size: inherit;
    }
    .raindrop-card-note th,
    .raindrop-card-note td {
      border: 1px solid var(--ls-border-color, #e5e7eb);
      padding: 4px 6px;
    }
    .raindrop-card-note th {
      background: var(--ls-secondary-background-color, #f3f4f6);
      font-weight: 600;
    }
    .raindrop-card-note img { max-width: 100%; height: auto; }
    .raindrop-card-note hr {
      margin: 0.8em 0;
      border: 0;
      border-top: 1px solid var(--ls-border-color, #e5e7eb);
    }
  `);

  logseq.App.registerUIItem("toolbar", {
    key: openIconName,
    template: `
    <a data-on-click="show" title="Raindrop" aria-label="Raindrop">
        <div class="${openIconName}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </div>
    </a>
    `,
  });

  // Register command palette commands
  logseq.App.registerCommandPalette(
    {
      key: "raindrop-sync",
      label: "Raindrop: Sync bookmarks",
},
    () => {
      logseq.showMainUI();
    }
  );

  // Ignore stale page lookups when navigation changes before the SDK responds.
  let disposed = false;
  let pageRequest = 0;
  const refreshBookmarks = async (clearPrevious = false) => {
    if (disposed) return;
    const request = ++pageRequest;
    if (clearPrevious) renderBookmarkCards(null);
    try {
      const pageName = await getCurrentPageName();
      if (request === pageRequest) renderBookmarkCards(pageName);
    } catch (error) {
      if (request === pageRequest) renderBookmarkCards(null);
      console.error(`#${pluginId}: Unable to read current page`, error);
    }
  };
  const offRoute = logseq.App.onRouteChanged(() => { void refreshBookmarks(true); });
  const offGraph = logseq.App.onCurrentGraphChanged(() => { void refreshBookmarks(true); });
  const offSettings = logseq.onSettingsChanged((settings, previous) => {
    if (settings.syncData?.lastSync !== previous.syncData?.lastSync) {
      void refreshBookmarks();
    }
  });
  void refreshBookmarks();

  // Auto sync on startup if enabled
  const autoSyncTimer = setTimeout(async () => {
    if (disposed) return;
    const settings = logseq.settings as Record<string, any> | undefined;
    const token = settings?.apiToken as string | undefined;
    const autoSync = settings?.autoSync !== false; // default true

    if (autoSync && token) {
      console.info(`#${pluginId}: Auto syncing...`);
      try {
        const api = new RaindropAPI(token);
        const data = await syncAll(api);
        if (disposed) return;
        await logseq.updateSettings({ syncData: data });
        console.info(`#${pluginId}: Auto sync complete, ${data.bookmarks.length} bookmarks`);
      } catch (err) {
        console.error(`#${pluginId}: Auto sync failed`, err);
      }
    }

    await refreshBookmarks();
  }, 1000);

  logseq.beforeunload(async () => {
    disposed = true;
    ++pageRequest;
    clearTimeout(autoSyncTimer);
    offRoute();
    offGraph();
    offSettings();
    stopThemeSync();
    renderBookmarkCards(null);
    parent.document.getElementById('raindrop-cards-container')?.remove();
    root.unmount();
  });
}

logseq.ready(main).catch(console.error);
