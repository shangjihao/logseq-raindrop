import React, { useCallback, useRef, useState } from "react";
import { useAppVisible } from "./utils";
import SyncPanel from "./components/SyncPanel";
import { RaindropAPI } from "./services/raindrop-api";
import { syncAll } from "./services/sync";
import { PluginSettings, SyncProgress } from "./types";

function App() {
  const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const settings = logseq.settings as unknown as PluginSettings | undefined;
  const token = settings?.apiToken || "";
  const syncData = settings?.syncData;

  const handleSync = useCallback(async () => {
    if (!token) {
      setError("API token not configured. Please set it in plugin settings.");
      return;
    }

    setSyncing(true);
    setError(null);
    setProgress(null);

    try {
      const api = new RaindropAPI(token);
      const data = await syncAll(api, (p) => setProgress(p));
      await logseq.updateSettings({ syncData: data });
      setProgress(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }, [token]);

  if (!visible) return null;

  return (
    <main
      className="backdrop-filter backdrop-blur-md fixed inset-0 flex items-center justify-center"
      onClick={(e) => {
        if (!innerRef.current?.contains(e.target as any)) {
          window.logseq.hideMainUI();
        }
      }}
    >
      <div
        ref={innerRef}
        className="bg-white rounded-xl shadow-lg w-full max-w-md"
      >
        <SyncPanel
          onSync={handleSync}
          syncing={syncing}
          progress={progress}
          lastSync={syncData?.lastSync ?? null}
          bookmarkCount={syncData?.bookmarks?.length ?? 0}
          error={error}
          tokenConfigured={!!token}
        />
      </div>
    </main>
  );
}

export default App;
