import React from 'react';
import { SyncProgress } from '../types';

interface Props {
  onSync: () => void;
  syncing: boolean;
  progress: SyncProgress | null;
  lastSync: string | null;
  bookmarkCount: number;
  error: string | null;
  tokenConfigured: boolean;
}

function SyncPanel({
  onSync,
  syncing,
  progress,
  lastSync,
  bookmarkCount,
  error,
  tokenConfigured,
}: Props) {
  if (!tokenConfigured) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <p className="text-sm raindrop-text-secondary">
          Please configure your Raindrop API token in plugin settings.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      <h2 className="text-lg font-semibold">Raindrop Sync</h2>

      <div className="space-y-1 text-sm raindrop-text-secondary">
        {lastSync && (
          <p>Last sync: {new Date(lastSync).toLocaleString()}</p>
        )}
        <p>{bookmarkCount} bookmarks</p>
      </div>

      {syncing && progress && (
        <div className="text-sm raindrop-text-accent">
          {progress.phase === 'collections'
            ? 'Fetching collections...'
            : `Fetching bookmarks... ${progress.current}/${progress.total}`}
        </div>
      )}

      {error && <p className="text-sm raindrop-text-error">{error}</p>}

      <button
        onClick={onSync}
        disabled={syncing}
        className="raindrop-sync-button px-4 py-2 rounded disabled:opacity-50"
      >
        {syncing ? 'Syncing...' : 'Sync Now'}
      </button>
    </div>
  );
}

export default SyncPanel;
