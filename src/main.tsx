import "@logseq/libs";

import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";
import BookmarkCards from "./components/BookmarkCards";
import { getBookmarksByTag, syncAll } from "./services/sync";
import { RaindropAPI } from "./services/raindrop-api";
import "./index.css";

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

let bottomRoot: ReactDOM.Root | null = null;

function renderBottomCards(pageName: string) {
  const bookmarks = getBookmarksByTag(pageName);

  let container = parent.document.getElementById("raindrop-cards-container");
  if (!container) {
    container = parent.document.createElement("div");
    container.id = "raindrop-cards-container";
    parent.document.body.appendChild(container);
  }

  if (bookmarks.length === 0) {
    if (bottomRoot) {
      bottomRoot.unmount();
      bottomRoot = null;
    }
    container.style.display = "none";
    return;
  }

  container.style.display = "block";

  if (!bottomRoot) {
    bottomRoot = ReactDOM.createRoot(container);
  }

  bottomRoot.render(
    <React.StrictMode>
      <BookmarkCards bookmarks={bookmarks} tagName={pageName} />
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
      opacity: 0.55;
      font-size: 20px;
      margin-top: 4px;
    }
    .${openIconName}:hover {
      opacity: 0.9;
    }

    /* Right-side toggle tab */
    .raindrop-toggle-tab {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-right: none;
      border-radius: 8px 0 0 8px;
      padding: 8px 6px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      box-shadow: -2px 0 8px rgba(0,0,0,0.06);
      transition: background 0.15s;
    }
    .raindrop-toggle-tab:hover {
      background: #f9fafb;
    }
    .raindrop-toggle-icon {
      font-size: 16px;
      line-height: 1;
    }
    .raindrop-toggle-count {
      font-size: 11px;
      color: #6b7280;
      font-weight: 500;
    }

    /* Right-side panel (dual-column layout) */
    .raindrop-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 360px;
      background: #fff;
      z-index: 10;
      border-left: 1px solid #e5e7eb;
      transform: translateX(100%);
      transition: transform 0.25s ease;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .raindrop-panel-open {
      transform: translateX(0);
    }
    .raindrop-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      flex-shrink: 0;
    }
    .raindrop-panel-title {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
    }
    .raindrop-panel-count {
      color: #9ca3af;
      font-weight: 400;
      margin-left: 6px;
    }
    .raindrop-panel-close {
      background: none;
      border: none;
      font-size: 16px;
      color: #9ca3af;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
    }
    .raindrop-panel-close:hover {
      color: #374151;
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
      border: 1px solid #e5e7eb;
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
      color: #2563eb;
      text-decoration: none;
      line-height: 1.4;
      display: block;
    }
    .raindrop-card-title:hover {
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
      color: #6b7280;
    }
    .raindrop-card-collection {
      font-size: 11px;
      background: #f3f4f6;
      color: #4b5563;
      padding: 1px 6px;
      border-radius: 4px;
    }
    .raindrop-card-date {
      font-size: 11px;
      color: #9ca3af;
    }
    .raindrop-card-note {
      margin-top: 6px;
      font-size: 12px;
      color: #6b7280;
      font-style: italic;
      line-height: 1.5;
    }
  `);

  logseq.App.registerUIItem("toolbar", {
    key: openIconName,
    template: `
    <a data-on-click="show">
        <div class="${openIconName}">🔖</div>
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

  // Listen for page/route changes to render bottom cards
  logseq.App.onRouteChanged(async () => {
    const pageName = await getCurrentPageName();
    if (pageName) {
      renderBottomCards(pageName);
    }
  });

  // Auto sync on startup if enabled
  setTimeout(async () => {
    const settings = logseq.settings as Record<string, any> | undefined;
    const token = settings?.apiToken as string | undefined;
    const autoSync = settings?.autoSync !== false; // default true

    if (autoSync && token) {
      console.info(`#${pluginId}: Auto syncing...`);
      try {
        const api = new RaindropAPI(token);
        const data = await syncAll(api);
        await logseq.updateSettings({ syncData: data });
        console.info(`#${pluginId}: Auto sync complete, ${data.bookmarks.length} bookmarks`);
      } catch (err) {
        console.error(`#${pluginId}: Auto sync failed`, err);
      }
    }

    // Render bottom cards for current page
    const pageName = await getCurrentPageName();
    if (pageName) {
      renderBottomCards(pageName);
    }
  }, 1000);
}

logseq.ready(main).catch(console.error);
