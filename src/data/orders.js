// Seeded order history so the Orders / Home screens feel lived-in.
// Orders the user places in the demo are stored in localStorage and merged
// in front of these.
import { getRestaurant } from './restaurants.js';
import { cartLines, snapshotLines, round2 } from '../lib/pricing.js';

const seed = (id, restaurantId, date, items, extra = {}) => {
  const restaurant = getRestaurant(restaurantId);
  const lines = cartLines(items.map(([dishId, qty, size = null, extras = []]) => ({ dishId, qty, size, extras, notes: '' })));
  const subtotal = round2(lines.reduce((a, l) => a + l.line, 0));
  const deliveryFee = restaurant.deliveryFee;
  return {
    id,
    restaurantId,
    placedAt: new Date(date).getTime(),
    status: 'delivered',
    items: snapshotLines(lines),
    subtotal,
    deliveryFee,
    discount: 0,
    total: round2(subtotal + deliveryFee),
    payment: 'card',
    seeded: true,
    ...extra,
  };
};

export const pastOrders = [
  seed('BT-40912', 'ember-bun', '2026-11-18T19:42:00', [
    ['classic-ember-burger', 2, 'single', ['cheese']],
    ['shoestring-fries', 1, 'regular'],
    ['salted-caramel-shake', 1, 'regular'],
  ]),
  seed('BT-39577', 'kumo', '2026-11-14T20:15:00', [
    ['salmon-aburi-roll', 1, 'p8', ['spicy-mayo']],
    ['tonkotsu-ramen', 1, 'regular', ['egg']],
    ['pan-fried-gyoza', 1, 'regular'],
  ]),
  seed('BT-38104', 'green-fork', '2026-11-09T12:30:00', [
    ['salmon-power-bowl', 1, 'regular', ['avocado']],
    ['berry-smoothie', 1, 'regular'],
  ]),
  seed('BT-36650', 'forno-nove', '2026-10-31T19:05:00', [
    ['hot-pepperoni', 1, 'l12'],
    ['margherita', 1, 'r10'],
    ['tiramisu', 2],
  ]),
  seed('BT-35021', 'daybreak', '2026-10-24T09:20:00', [
    ['stacked-pancakes', 1, 'regular'],
    ['flat-white', 2, 'small', ['oat']],
  ]),
  seed(
    'BT-34418',
    'masala-house',
    '2026-10-17T20:40:00',
    [
      ['butter-chicken', 1, 'regular', ['naan']],
      ['vegetable-samosas', 1, 'regular'],
    ],
    { status: 'cancelled' },
  ),
];

// Simulated tracking timeline. Offsets are in seconds since the order was
// placed — accelerated so a reviewer can watch the full flow in ~2 minutes.
export const ORDER_STEPS = [
  { id: 'received', label: 'Order received', detail: 'The restaurant has your order', at: 0 },
  { id: 'preparing', label: 'Preparing', detail: 'Your food is being made fresh', at: 12 },
  { id: 'picked', label: 'Picked up', detail: 'Your courier has collected the order', at: 40 },
  { id: 'onway', label: 'On the way', detail: 'Heading to your door', at: 55 },
  { id: 'delivered', label: 'Delivered', detail: 'Enjoy your meal!', at: 110 },
];

export const COURIERS = [
  { name: 'Daniel R.', vehicle: 'E-bike', rating: 4.9, deliveries: 1240, initials: 'DR' },
  { name: 'Priya K.', vehicle: 'Scooter', rating: 4.8, deliveries: 860, initials: 'PK' },
  { name: 'Marco T.', vehicle: 'E-bike', rating: 5.0, deliveries: 2110, initials: 'MT' },
];
