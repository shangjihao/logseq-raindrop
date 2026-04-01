import { LocalBookmark, PluginSettings, SyncData, SyncProgress } from '../types';
import { RaindropAPI } from './raindrop-api';

export async function syncAll(
  api: RaindropAPI,
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncData> {
  const collections = await api.getCollections();

  const collectionMap: Record<number, string> = {};
  for (const col of collections) {
    collectionMap[col._id] = col.title;
  }

  onProgress?.({ phase: 'collections', current: 1, total: 1 });

  const bookmarks: LocalBookmark[] = [];
  let page = 0;
  let totalPages = 1;

  do {
    const { items, count } = await api.getRaindrops(0, page);
    totalPages = Math.ceil(count / 50);

    for (const item of items) {
      bookmarks.push({
        id: item._id,
        title: item.title,
        url: item.link,
        domain: item.domain,
        tags: item.tags,
        collectionName: collectionMap[item.collection.$id] ?? '',
        note: item.note,
        created: item.created,
      });
    }

    onProgress?.({ phase: 'bookmarks', current: page + 1, total: totalPages || 1 });

    page++;
  } while (page < totalPages);

  return {
    bookmarks,
    lastSync: new Date().toISOString(),
    collectionMap,
  };
}

export function getBookmarksByTag(tag: string): LocalBookmark[] {
  const settings = logseq.settings as unknown as PluginSettings | undefined;
  const bookmarks = settings?.syncData?.bookmarks ?? [];
  const lowerTag = tag.toLowerCase();
  return bookmarks.filter((bookmark) =>
    bookmark.tags.some((t) => t.toLowerCase() === lowerTag)
  );
}
