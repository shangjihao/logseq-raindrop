import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LocalBookmark, PluginSettings } from '../types';
import { usePageNotice } from '../hooks/usePageNotice';
import BookmarkCard from './BookmarkCard';

interface Props {
  bookmarks: LocalBookmark[];
  tagName: string;
}

function BookmarkCards({ bookmarks, tagName }: Props) {
  const [open, setOpen] = useState(false);
  const noticeContainer = usePageNotice(tagName);
  const panelOpen = open && noticeContainer !== null;

  const [preferredWidth, setPreferredWidth] = useState(() => {
    const saved = (logseq.settings as unknown as PluginSettings)?.sidebarWidth;
    return typeof saved === 'number' && Number.isFinite(saved) ? saved : 360;
  });
  const [viewportWidth, setViewportWidth] = useState(parent.innerWidth);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ pointerId: number; x: number; width: number } | null>(null);
  const maxWidth = Math.max(0, viewportWidth - Math.min(320, viewportWidth / 2));
  const minWidth = Math.min(260, maxWidth);
  const clampWidth = (value: number) => Math.round(Math.min(maxWidth, Math.max(minWidth, value)));
  const width = clampWidth(preferredWidth);
  const widthRef = useRef(width);
  widthRef.current = width;

  useEffect(() => {
    const onResize = () => setViewportWidth(parent.innerWidth);
    parent.addEventListener('resize', onResize);
    return () => parent.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const style = parent.document.body.style;
    const cursor = style.cursor;
    const userSelect = style.userSelect;
    style.cursor = 'col-resize';
    style.userSelect = 'none';
    return () => {
      style.cursor = cursor;
      style.userSelect = userSelect;
    };
  }, [dragging]);

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, width };
    setDragging(true);
  };

  const resize = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const nextWidth = clampWidth(drag.width + drag.x - event.clientX);
    widthRef.current = nextWidth;
    setPreferredWidth(nextWidth);
  };

  const finishResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    logseq.updateSettings({ sidebarWidth: widthRef.current });
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const resizeWithKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let nextWidth: number;
    switch (event.key) {
      case 'ArrowLeft': nextWidth = width + 20; break;
      case 'ArrowRight': nextWidth = width - 20; break;
      case 'Home': nextWidth = minWidth; break;
      case 'End': nextWidth = maxWidth; break;
      default: return;
    }
    event.preventDefault();
    nextWidth = clampWidth(nextWidth);
    setPreferredWidth(nextWidth);
    logseq.updateSettings({ sidebarWidth: nextWidth });
  };

  useLayoutEffect(() => {
    const appContainer =
      parent.document.getElementById("app-container") ||
      parent.document.getElementById("main-container");
    if (!appContainer) return;

    const { marginRight, transition } = appContainer.style;
    appContainer.style.marginRight = panelOpen ? `${width}px` : marginRight;
    appContainer.style.transition = dragging ? 'none' : 'margin-right 0.25s ease';

    return () => {
      appContainer.style.marginRight = marginRight;
      appContainer.style.transition = transition;
    };
  }, [panelOpen, width, dragging]);

  if (!noticeContainer) return null;

  return (
    <>
      {createPortal(
        <button
          type="button"
          className="raindrop-page-notice"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={panelOpen}
          aria-controls="raindrop-bookmarks-panel"
        >
          <svg
            className="raindrop-page-notice-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span>Related bookmarks · {bookmarks.length}</span>
          <span className="raindrop-page-notice-action">{panelOpen ? 'Hide' : 'View →'}</span>
        </button>,
        noticeContainer
      )}

      {/* Right-side panel */}
      <div
        id="raindrop-bookmarks-panel"
        className={`raindrop-panel ${panelOpen ? 'raindrop-panel-open' : ''}`}
        style={{ width }}
      >
        <div
          className={`raindrop-panel-resize ${dragging ? 'raindrop-panel-resizing' : ''}`}
          role="separator"
          aria-label="Resize Raindrop sidebar"
          aria-orientation="vertical"
          aria-valuemin={minWidth}
          aria-valuemax={maxWidth}
          aria-valuenow={width}
          aria-valuetext={`${width} pixels`}
          tabIndex={panelOpen ? 0 : -1}
          title="Drag to resize; use arrow keys for fine adjustments"
          onPointerDown={startResize}
          onPointerMove={resize}
          onPointerUp={finishResize}
          onPointerCancel={finishResize}
          onLostPointerCapture={finishResize}
          onKeyDown={resizeWithKeyboard}
        />
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
