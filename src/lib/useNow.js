import { useEffect, useState } from 'react';

/** Re-renders the caller every `ms` while `enabled`. */
export function useNow(ms = 1000, enabled = true) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!enabled) return undefined;
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms, enabled]);
  return now;
}

export function itemsSummary(items, max = 2) {
  const parts = items.slice(0, max).map((i) => `${i.qty}× ${i.name}`);
  const more = items.length - max;
  return parts.join(', ') + (more > 0 ? ` +${more} more` : '');
}
