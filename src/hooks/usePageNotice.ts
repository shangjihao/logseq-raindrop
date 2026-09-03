import { useLayoutEffect, useState } from 'react';

// The host owns the page DOM and can replace its title during navigation/editing.
export function usePageNotice(pageName: string): HTMLElement | null {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const host = parent.document;
    const container = host.createElement('div');
    container.className = 'raindrop-page-notice-container';
    const normalizedName = pageName.toLowerCase();

    const placeNotice = () => {
      const main = host.getElementById('main-content-container') ||
        host.getElementById('main-container');
      const titles = main?.querySelectorAll<HTMLElement>('.ls-page-title, .page-title, h1.title');
      const title = Array.from(titles ?? []).find((element) => {
        const name = element.querySelector('.title[data-ref]')?.getAttribute('data-ref') ||
          element.getAttribute('data-ref') || element.textContent?.trim();
        return name?.toLowerCase() === normalizedName;
      });
      // In Logseq 0.10.x the title shares a flex row with page menu actions.
      const anchor = title?.closest('.flex.flex-row.space-between') || title;
      if (!anchor?.parentElement) {
        container.remove();
        setTarget((previous) => previous === null ? previous : null);
        return;
      }
      if (anchor.nextSibling !== container) anchor.after(container);
      setTarget((previous) => previous === container ? previous : container);
    };

    placeNotice();
    const observer = new MutationObserver(placeNotice);
    observer.observe(host.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-ref'],
    });

    return () => {
      observer.disconnect();
      container.remove();
    };
  }, [pageName]);

  return target;
}
