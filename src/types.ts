// Raindrop API response types
export interface RaindropCollection {
  _id: number;
  title: string;
  count: number;
}

export interface RaindropItem {
  _id: number;
  title: string;
  link: string;
  domain: string;
  excerpt: string;
  tags: string[];
  collection: { $id: number };
  note: string;
  created: string;
  lastUpdate: string;
}

// Local storage types
export interface LocalBookmark {
  id: number;
  title: string;
  url: string;
  domain: string;
  tags: string[];
  collectionName: string;
  note: string;
  created: string;
}

export interface SyncData {
  bookmarks: LocalBookmark[];
  lastSync: string;
  collectionMap: Record<number, string>;
}

export interface PluginSettings {
  apiToken: string;
  autoSync: boolean;
  syncData: SyncData;
}

export interface SyncProgress {
  phase: 'collections' | 'bookmarks';
  current: number;
  total: number;
}
