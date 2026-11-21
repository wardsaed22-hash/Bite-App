import { ORDER_STEPS } from '../data/orders.js';

const LAST = ORDER_STEPS[ORDER_STEPS.length - 1].at;

/** Derive the simulated status of an order from the clock. */
export function orderProgress(order, now = Date.now()) {
  if (order.status === 'cancelled') return { step: -1, progress: 0, done: true, cancelled: true };
  if (order.status === 'delivered') return { step: ORDER_STEPS.length - 1, progress: 1, done: true };
  const elapsed = Math.max(0, (now - order.simStart) / 1000);
  let step = 0;
  ORDER_STEPS.forEach((s, i) => {
    if (elapsed >= s.at) step = i;
  });
  return { step, progress: Math.min(1, elapsed / LAST), done: step === ORDER_STEPS.length - 1, elapsed };
}

export const isActive = (order, now) => order.status === 'active' && !orderProgress(order, now).done;

/** Minutes remaining, scaled from the real ETA to the accelerated demo timeline. */
export function minutesLeft(order, now = Date.now()) {
  const { progress, done } = orderProgress(order, now);
  if (done) return 0;
  return Math.max(1, Math.ceil(order.etaMinutes * (1 - progress)));
}

export const stepAt = (order, i) => order.simStart + ORDER_STEPS[i].at * 1000;

export function generateOrderId() {
  return `BT-${Math.floor(41000 + Math.random() * 58999)}`;
}
