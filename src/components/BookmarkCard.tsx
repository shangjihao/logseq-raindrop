import React from 'react';
import { LocalBookmark } from '../types';

interface Props {
  bookmark: LocalBookmark;
}

function BookmarkCard({ bookmark }: Props) {
  return (
    <div className="raindrop-card">
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="raindrop-card-title"
      >
        {bookmark.title}
      </a>
      <div className="raindrop-card-meta">
        <span className="raindrop-card-domain">{bookmark.domain}</span>
        {bookmark.collectionName && (
          <span className="raindrop-card-collection">{bookmark.collectionName}</span>
        )}
        <span className="raindrop-card-date">
          {new Date(bookmark.created).toLocaleDateString()}
        </span>
      </div>
      {bookmark.note && (
        <p className="raindrop-card-note">{bookmark.note}</p>
      )}
    </div>
  );
}

export default BookmarkCard;
