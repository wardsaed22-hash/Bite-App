import { getDish, getOptions } from '../data/dishes.js';
import { getRestaurant } from '../data/restaurants.js';

export const round2 = (n) => Math.round(n * 100) / 100;

export const defaultSize = (dish) => getOptions(dish).sizes[0]?.id ?? null;

export function unitPrice(dish, size, extras = []) {
  const o = getOptions(dish);
  const s = o.sizes.find((x) => x.id === size);
  const e = o.extras.filter((x) => extras.includes(x.id));
  return round2(dish.price + (s?.price || 0) + e.reduce((a, x) => a + x.price, 0));
}

/** Human-readable summary of the chosen options, e.g. "Double patty · Bacon, Avocado". */
export function optionsText(dish, size, extras = []) {
  const o = getOptions(dish);
  const parts = [];
  const s = o.sizes.find((x) => x.id === size);
  if (s && o.sizes.length > 1) parts.push(s.label);
  const e = o.extras.filter((x) => extras.includes(x.id)).map((x) => x.label);
  if (e.length) parts.push(e.join(', '));
  return parts.join(' · ');
}

/** Identical configurations collapse into one cart line. */
export const itemKey = ({ dishId, size, extras, notes }) => [dishId, size || '', [...(extras || [])].sort().join('+'), (notes || '').trim()].join('|');

// Demo promo codes — purely client-side.
export const PROMO_CODES = {
  BITE20: { label: '20% off, up to $10', compute: (sub) => Math.min(sub * 0.2, 10) },
  WELCOME5: { label: '$5 off your order', compute: (sub) => Math.min(5, sub) },
};

export function cartLines(items) {
  return items
    .map((it) => {
      const dish = getDish(it.dishId);
      if (!dish) return null;
      const unit = unitPrice(dish, it.size, it.extras);
      return { ...it, dish, unit, line: round2(unit * it.qty), optionsText: optionsText(dish, it.size, it.extras) };
    })
    .filter(Boolean);
}

export function cartTotals(cart) {
  const restaurant = getRestaurant(cart.restaurantId);
  const lines = cartLines(cart.items);
  const subtotal = round2(lines.reduce((a, l) => a + l.line, 0));
  const count = lines.reduce((a, l) => a + l.qty, 0);
  const deliveryFee = lines.length ? restaurant?.deliveryFee || 0 : 0;
  const promo = cart.promo ? PROMO_CODES[cart.promo] : null;
  const discount = promo ? round2(promo.compute(subtotal)) : 0;
  const total = round2(Math.max(0, subtotal + deliveryFee - discount));
  return { restaurant, lines, subtotal, count, deliveryFee, discount, promo, total };
}

/** Frozen copy of the cart lines stored on an order, so it survives menu changes. */
export const snapshotLines = (lines) =>
  lines.map(({ dishId, qty, size, extras, notes, unit, dish, optionsText: ot }) => ({
    dishId,
    name: dish.name,
    qty,
    size,
    extras,
    notes,
    unit,
    optionsText: ot,
  }));
