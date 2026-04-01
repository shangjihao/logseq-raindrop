import React, { useState, useEffect } from 'react';
import { LocalBookmark } from '../types';
import BookmarkCard from './BookmarkCard';

interface Props {
  bookmarks: LocalBookmark[];
  tagName: string;
}

function BookmarkCards({ bookmarks, tagName }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const appContainer =
      parent.document.getElementById("app-container") ||
      parent.document.getElementById("main-container");
    if (!appContainer) return;

    if (open) {
      appContainer.style.marginRight = "360px";
      appContainer.style.transition = "margin-right 0.25s ease";
    } else {
      appContainer.style.marginRight = "";
    }

    return () => {
      appContainer.style.marginRight = "";
    };
  }, [open]);

  return (
    <>
      {/* Toggle tab fixed on the right edge */}
      <div
        className="raindrop-toggle-tab"
        onClick={() => setOpen(!open)}
        title={`${bookmarks.length} bookmarks for "${tagName}"`}
      >
        <span className="raindrop-toggle-icon">🔖</span>
        <span className="raindrop-toggle-count">{bookmarks.length}</span>
      </div>

      {/* Right-side panel */}
      <div className={`raindrop-panel ${open ? 'raindrop-panel-open' : ''}`}>
        <div className="raindrop-panel-header">
          <span className="raindrop-panel-title">
            {tagName}
            <span className="raindrop-panel-count">({bookmarks.length})</span>
          </span>
          <button
            className="raindrop-panel-close"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="raindrop-panel-body">
          {bookmarks.map((bookmark) => (
            <BookmarkCard key={bookmark.id} bookmark={bookmark} />
          ))}
        </div>
      </div>
    </>
  );
}

export default BookmarkCards;
