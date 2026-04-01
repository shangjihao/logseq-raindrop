import { useState, useEffect } from 'react';
import { LocalBookmark } from '../types';
import { getBookmarksByTag } from '../services/sync';

export function usePageBookmarks(pageName: string | null): LocalBookmark[] {
  const [bookmarks, setBookmarks] = useState<LocalBookmark[]>([]);

  useEffect(() => {
    if (!pageName) {
      setBookmarks([]);
      return;
    }
    const matched = getBookmarksByTag(pageName);
    setBookmarks(matched);
  }, [pageName]);

  return bookmarks;
}
