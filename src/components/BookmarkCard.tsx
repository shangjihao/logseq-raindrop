import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LocalBookmark } from '../types';

interface Props {
  bookmark: LocalBookmark;
}

const markdownComponents: Components = {
  a: ({ href, title, children }) => (
    <a
      href={href}
      title={title}
      target={href?.startsWith('#') ? undefined : '_blank'}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="raindrop-note-table">
      <table>{children}</table>
    </div>
  ),
};

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
        <div className="raindrop-card-note">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents} skipHtml>
            {bookmark.note}
          </ReactMarkdown>
        </div>
      )}
      {bookmark.tags?.length > 0 && (
        <ul className="raindrop-card-tags" aria-label="Tags">
          {bookmark.tags.map((tag, index) => (
            <li className="raindrop-card-tag" key={`${tag}-${index}`}>
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default React.memo(BookmarkCard);
