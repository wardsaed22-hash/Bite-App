// Tiny hash router (~60 lines) — avoids a router dependency while still
// supporting deep links, the browser back button and push/pop direction
// (used for app-like screen transitions and scroll restoration).
import { useSyncExternalStore } from 'react';

const listeners = new Set();
let idx = 0;
let direction = 'none';
let snapshot = null;

function read() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  return {
    path: path || '/',
    parts: (path || '/').split('/').filter(Boolean),
    query: Object.fromEntries(new URLSearchParams(qs)),
    direction,
    href: raw,
  };
}

function emit(dir) {
  direction = dir;
  snapshot = read();
  listeners.forEach((l) => l());
}

if (typeof window !== 'undefined') {
  const st = window.history.state;
  if (st && typeof st.idx === 'number') idx = st.idx;
  else window.history.replaceState({ idx: 0 }, '');
  snapshot = read();

  window.addEventListener('popstate', (e) => {
    const n = e.state?.idx;
    let dir = 'back';
    if (typeof n === 'number') {
      dir = n < idx ? 'back' : 'forward';
      idx = n;
    } else {
      // Manually edited hash — treat as a forward navigation.
      idx += 1;
      window.history.replaceState({ idx }, '');
      dir = 'forward';
    }
    emit(dir);
  });
}

export function navigate(to, { replace = false } = {}) {
  const url = `#${to}`;
  if (!replace && url === window.location.hash) return;
  if (replace) window.history.replaceState({ idx }, '', url);
  else {
    idx += 1;
    window.history.pushState({ idx }, '', url);
  }
  emit(replace ? 'replace' : 'forward');
}

/** Go back within the app, or fall back to a sensible parent screen. */
export function goBack(fallback = '/') {
  if (idx > 0) window.history.back();
  else navigate(fallback, { replace: true });
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useRoute = () => useSyncExternalStore(subscribe, () => snapshot);

/** Props for an <a> that routes without a full navigation. */
export function linkProps(to, opts) {
  return {
    href: `#${to}`,
    onClick: (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      navigate(to, opts);
    },
  };
}
