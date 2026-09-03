// The main UI lives in an iframe, so it cannot inherit the host's CSS variables.
const themeProperties = [
  "--ls-primary-background-color",
  "--ls-secondary-background-color",
  "--ls-tertiary-background-color",
  "--ls-primary-text-color",
  "--ls-secondary-text-color",
  "--ls-border-color",
  "--ls-link-text-color",
  "--ls-link-text-hover-color",
  "--ls-error-text-color",
  "--ls-font-family",
];

export function syncLogseqTheme(): () => void {
  const hostDocument = parent.document;
  const target = document.documentElement;
  let frame: number | null = null;

  const sync = () => {
    const styles = parent.getComputedStyle(hostDocument.body);
    for (const property of themeProperties) {
      const value = styles.getPropertyValue(property).trim();
      if (value) {
        target.style.setProperty(property, value);
      } else {
        target.style.removeProperty(property);
      }
    }
  };

  const scheduleSync = () => {
    if (frame !== null) return;
    frame = window.requestAnimationFrame(() => {
      frame = null;
      sync();
    });
  };

  sync();
  const offMode = logseq.App.onThemeModeChanged(scheduleSync);
  const offTheme = logseq.App.onThemeChanged(scheduleSync);
  logseq.on("ui:visible:changed", scheduleSync);

  // Also catch custom CSS edits and theme stylesheets that load after the event.
  const observer = new MutationObserver(scheduleSync);
  for (const element of [hostDocument.documentElement, hostDocument.body]) {
    observer.observe(element, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });
  }
  observer.observe(hostDocument.head, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["href", "media", "disabled"],
  });
  hostDocument.head.addEventListener("load", scheduleSync, true);

  return () => {
    observer.disconnect();
    hostDocument.head.removeEventListener("load", scheduleSync, true);
    offMode();
    offTheme();
    logseq.off("ui:visible:changed", scheduleSync);
    if (frame !== null) window.cancelAnimationFrame(frame);
  };
}
