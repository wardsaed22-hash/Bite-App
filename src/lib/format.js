const BASE = import.meta.env.BASE_URL;

export const money = (n) => `$${(Math.round(n * 100) / 100).toFixed(2)}`;

export const foodImg = (name, small = false) => `${BASE}images/food/${name}${small ? '-sm' : ''}.webp`;
export const restaurantImg = (name, small = false) => `${BASE}images/restaurants/${name}${small ? '-sm' : ''}.webp`;
export const assetImg = (folder, name) => `${BASE}images/${folder}/${name}.webp`;

export const priceLevel = (n) => '$'.repeat(n);

export const etaText = ([a, b]) => `${a}–${b} min`;

export const feeText = (fee) => (fee === 0 ? 'Free delivery' : `${money(fee)} delivery`);

export const formatCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n));

export const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export const formatDate = (ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const formatDay = (ts) => new Date(ts).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

export function relativeTime(ts, now = Date.now()) {
  const m = Math.round((now - ts) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.round(h / 24);
  if (days < 7) return `${days} d ago`;
  return formatDate(ts);
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'Late-night cravings';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;

export const formatShort = (ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
